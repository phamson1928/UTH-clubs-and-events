import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Filters = {
  query: string;
  category: string;
  sort: string;
};

export default function SearchAndFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (v: Filters) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
        />
      </div>

      <Select
        value={value.category}
        onValueChange={(v) => onChange({ ...value, category: v })}
      >
        <SelectTrigger className="w-full md:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Technology">Technology</SelectItem>
          <SelectItem value="Arts">Arts</SelectItem>
          <SelectItem value="Sports">Sports</SelectItem>
          <SelectItem value="Music">Music</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.sort}
        onValueChange={(v) => onChange({ ...value, sort: v })}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="name">Name (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export type { Filters };
