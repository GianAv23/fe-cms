import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Path } from "@/router";
import type { News } from "@/types";
import { useNavigate } from "react-router";
import useSWR from "swr";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import newsIcon from "/animation/news.svg";

const NewsList = () => {
  const navigate = useNavigate();
  const { data: News } = useSWR<News>(`/news/news-cms`);

  const events = News?.news || [];
  const eventCount = events.length;
  const placeholderCount = Math.max(0, 5 - eventCount);

  const placeholders = Array.from({ length: placeholderCount }, (_, i) => i);

  return (
    <Card className="bg-sidebar gap-0 border-[0.5px] py-0 shadow-none">
      <CardHeader className="gap-0 rounded-t-xl px-3 pb-4">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-md lg:text-lg">News List</CardTitle>
            <CardDescription className="text-xs lg:text-base">
              Show 5 latest news
            </CardDescription>
          </div>
          <div>
            <img
              src={newsIcon}
              alt="News Icon"
              className="size-24 md:size-28"
            />
          </div>
        </div>

        <div className="bg-primary-news/10 text-primary-news flex flex-1 flex-row items-center justify-between gap-4 rounded-sm px-2 py-1">
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm font-semibold">News Created</span>
          </div>
          <span className="font-mono text-lg md:text-xl">
            {News?.total || 0}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 rounded-xl border-t-[0.5px] bg-white px-3 py-4 shadow-[0px_-10px_18px_-13px_rgba(0,_0,_0,_0.1)]">
        <div className="flex w-full flex-col gap-2">
          {News?.news.slice(0, 5).map((news) => (
            <div
              key={news.uuid}
              className="hover:bg-accent bg-sidebar flex cursor-pointer flex-row justify-between gap-2 rounded-md border p-2"
              onClick={() => {
                navigate(`/dashboard/news/${news.uuid}` as Path, {});
              }}
            >
              <div className="flex flex-col justify-between">
                <span className="text-sm font-medium">{news.title}</span>
                <div className="text-muted-foreground text-xs lg:text-sm">
                  {new Date(news.updated_at).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <Badge variant={news.published ? "default" : "outline"}>
                  {news.published ? "Published" : "Draft"}
                </Badge>
                <div className="b">
                  <span className="text-muted-foreground font-mono text-sm lg:text-base">
                    {news.category ? news.category : "Uncategorized"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Render empty placeholder rows */}
          {placeholders.map((index) => (
            <div
              key={`placeholder-${index}`}
              className="bg-sidebar/50 flex flex-row justify-between gap-2 rounded-md border border-dashed p-2"
            >
              <div className="flex flex-col justify-between">
                <span className="text-muted-foreground/50 text-sm font-medium">
                  No News Added
                </span>
                <div className="text-muted-foreground/30 text-xs lg:text-sm">
                  --
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <span className="text-muted-foreground/50 text-md font-mono lg:text-xl">
                  -
                </span>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant={"outline"}
          className="w-full"
          onClick={() => navigate("/dashboard/news")}
        >
          View More
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewsList;
