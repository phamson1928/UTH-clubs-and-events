import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventFeedback } from './entities/event_feedback.entity';
import { EventRegistration } from '../event_registrations/entities/event_registration.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(EventFeedback)
        private readonly feedbackRepo: Repository<EventFeedback>,
        @InjectRepository(EventRegistration)
        private readonly regRepo: Repository<EventRegistration>,
        @InjectRepository(Event)
        private readonly eventsRepo: Repository<Event>,
    ) { }

    // ─── Submit feedback ──────────────────────────────────────────
    async submitFeedback(
        eventId: number,
        userId: number,
        rating: number,
        comment?: string,
    ) {
        // Validate rating range
        if (rating < 1 || rating > 5)
            throw new BadRequestException('Đánh giá phải từ 1 đến 5 sao');

        // Verify event exists and is past/ended
        const event = await this.eventsRepo.findOne({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Sự kiện không tồn tại');
        if (event.status !== 'approved')
            throw new BadRequestException('Chỉ có thể gửi feedback cho sự kiện đã được duyệt');

        // User must have attended (checked-in) the event
        const registration = await this.regRepo.findOne({
            where: { event: { id: eventId }, user: { id: userId } },
            relations: ['event', 'user'],
        });
        if (!registration)
            throw new ForbiddenException('Bạn chưa đăng ký sự kiện này');
        if (!registration.attended)
            throw new ForbiddenException('Chỉ những người đã điểm danh mới có thể gửi đánh giá');

        // Check duplicate
        const existing = await this.feedbackRepo.findOne({
            where: { event: { id: eventId }, user: { id: userId } },
        });
        if (existing)
            throw new ConflictException('Bạn đã gửi đánh giá cho sự kiện này rồi');

        const feedback = this.feedbackRepo.create({
            event: { id: eventId },
            user: { id: userId },
            rating,
            comment: comment ?? null,
        });

        const saved = await this.feedbackRepo.save(feedback);
        return {
            message: 'Cảm ơn bạn đã gửi đánh giá!',
            feedbackId: saved.id,
            rating: saved.rating,
            comment: saved.comment,
        };
    }

    // ─── Get feedback for an event (public summary) ───────────────
    async getEventFeedbackSummary(eventId: number) {
        const feedbacks = await this.feedbackRepo.find({
            where: { event: { id: eventId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        if (!feedbacks.length)
            return { eventId, totalReviews: 0, averageRating: null, distribution: {}, reviews: [] };

        const total = feedbacks.length;
        const avg = feedbacks.reduce((s, f) => s + f.rating, 0) / total;

        // Rating distribution
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        feedbacks.forEach((f) => distribution[f.rating]++);

        return {
            eventId,
            totalReviews: total,
            averageRating: Math.round(avg * 10) / 10,
            distribution,
            reviews: feedbacks.map((f) => ({
                id: f.id,
                rating: f.rating,
                comment: f.comment,
                createdAt: f.createdAt,
                user: { id: f.user.id, name: f.user.name },
            })),
        };
    }

    // ─── Admin / Owner: all feedbacks for an event ────────────────
    async getEventFeedbackDetailed(eventId: number) {
        const feedbacks = await this.feedbackRepo.find({
            where: { event: { id: eventId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        return feedbacks.map((f) => ({
            id: f.id,
            rating: f.rating,
            comment: f.comment,
            createdAt: f.createdAt,
            userId: f.user.id,
            userName: f.user.name,
            userEmail: f.user.email,
            mssv: f.user.mssv,
        }));
    }

    // ─── User's own feedback ──────────────────────────────────────
    async getMyFeedback(userId: number) {
        const feedbacks = await this.feedbackRepo.find({
            where: { user: { id: userId } },
            relations: ['event'],
            order: { createdAt: 'DESC' },
        });
        return feedbacks.map((f) => ({
            feedbackId: f.id,
            eventId: f.event.id,
            eventName: f.event.name,
            rating: f.rating,
            comment: f.comment,
            createdAt: f.createdAt,
        }));
    }

    // ─── Update feedback (change rating/comment before event is too old) ──
    async updateFeedback(feedbackId: number, userId: number, rating?: number, comment?: string) {
        const feedback = await this.feedbackRepo.findOne({
            where: { id: feedbackId },
            relations: ['user'],
        });
        if (!feedback) throw new NotFoundException('Feedback không tồn tại');
        if (feedback.user.id !== userId)
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa feedback này');

        if (rating !== undefined) {
            if (rating < 1 || rating > 5)
                throw new BadRequestException('Đánh giá phải từ 1 đến 5 sao');
            feedback.rating = rating;
        }
        if (comment !== undefined) feedback.comment = comment;

        await this.feedbackRepo.save(feedback);
        return { message: 'Cập nhật đánh giá thành công', rating: feedback.rating, comment: feedback.comment };
    }

    // ─── Delete feedback ──────────────────────────────────────────
    async deleteFeedback(feedbackId: number, userId: number, userRole: string) {
        const feedback = await this.feedbackRepo.findOne({
            where: { id: feedbackId },
            relations: ['user'],
        });
        if (!feedback) throw new NotFoundException('Feedback không tồn tại');
        if (userRole !== 'admin' && feedback.user.id !== userId)
            throw new ForbiddenException('Bạn không có quyền xóa feedback này');

        await this.feedbackRepo.delete(feedbackId);
        return { message: 'Đã xóa đánh giá' };
    }
}
