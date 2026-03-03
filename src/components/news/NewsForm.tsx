import RequiredLabel from "@/components/RequiredLabel";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { NewsItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import z from "zod";
import Tiptap from "../rich-text-editor/Tiptap";

const categoryEnum = z.enum(["INTERNAL", "EXTERNAL"]);

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: categoryEnum,
  published: z.boolean().default(false).optional(),
  external_link: z.union([z.string().url(), z.string().max(0), z.undefined()]),
});

export type NewsFormFillable = z.infer<typeof newsSchema>;
interface NewsFormProps {
  mode: "create" | "edit";
  formId: string;
  initialData?: NewsItem;
  onSubmit: (data: NewsFormFillable) => void;
  onFormChange?: (form: UseFormReturn<NewsFormFillable>) => void;
}

const formatCategoryName = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const NewsForm = ({
  mode,
  formId,
  initialData,
  onSubmit,
  onFormChange,
}: NewsFormProps) => {
  const defaultValues: NewsFormFillable = useMemo(() => {
    if (mode === "edit" && initialData) {
      return {
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "INTERNAL",
        published: initialData.published || false,
        external_link: initialData.external_link || "",
      };
    }
    return {
      title: "",
      content: "",
      category: "INTERNAL",
      published: false,
      external_link: "",
    };
  }, [initialData, mode]);

  const form = useForm<NewsFormFillable>({
    resolver: zodResolver(newsSchema),
    defaultValues,
  });

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  return (
    <div className="grid flex-1 auto-rows-min gap-6 px-4">
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {mode === "create" && (
            <div className="bg-muted flex w-full items-center gap-2 rounded-md p-2">
              <Info className="text-muted-foreground h-4 w-4" />
              <p className="text-muted-foreground text-sm">
                Upload news image after saving
              </p>
            </div>
          )}

          {/* News Title Start */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="title">
                  <RequiredLabel>Title</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <Input
                    id="title"
                    placeholder="Enter news title"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* News Title End */}

          {/* News Content Start */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="content">
                  <RequiredLabel>Content</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <Tiptap
                    content={field.value}
                    onChange={field.onChange}
                    news_uuid={initialData?.uuid}
                  />
                  {/* <Textarea
                    id="content"
                    placeholder="Enter news content"
                    className="text-sm"
                    {...field}
                  /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* News Content End */}

          {/* News Category Start*/}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="category">
                  <RequiredLabel>Category</RequiredLabel>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select news category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryEnum.options.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="text-sm"
                      >
                        {formatCategoryName(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* News Category End */}

          {/* News External Link Start */}
          <FormField
            control={form.control}
            name="external_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="external_link">External Link</FormLabel>
                <FormControl>
                  <Input
                    id="external_link"
                    placeholder="Enter external link"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* News External Link End */}

          {/* News Published Start */}
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem
                className={`flex flex-row items-center justify-between rounded-md p-4 transition-all duration-200 ease-in-out ${
                  field.value
                    ? "bg-primary/10 border-primary border shadow-sm"
                    : "bg-accent"
                }`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <FormLabel
                    htmlFor="published"
                    className={field.value ? "text-primary font-medium" : ""}
                  >
                    Published
                  </FormLabel>
                  {field.value ? (
                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                      Published
                    </span>
                  ) : (
                    <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                      Draft
                    </span>
                  )}
                </div>
                <FormControl>
                  <Switch
                    id="published"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="cursor-pointer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* News Published End */}
        </form>
      </Form>
    </div>
  );
};

export default NewsForm;
