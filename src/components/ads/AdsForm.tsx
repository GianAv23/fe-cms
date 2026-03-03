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
import { Textarea } from "@/components/ui/textarea";
import type { AdsItem } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import z from "zod";

const categoryEnum = z.enum(["INTERNAL", "EXTERNAL"]);

const adsSchema = (externalCategory: boolean) => {
  return z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    category: categoryEnum,
    partner_name: externalCategory
      ? z
          .union([
            z.string().min(1, "Partner name is required"),
            z.null(),
            z.undefined(),
          ])
          .transform((val) => val || "")
          .refine((val) => val.length > 0, "Partner name is required")
      : z.string().optional().nullable(),
    published: z.boolean().default(false).optional(),
    external_link: z.string().min(1, "External link is required").url(),
  });
};

export type AdsFormFillable = z.infer<ReturnType<typeof adsSchema>>;

interface AdsFormProps {
  mode: "create" | "edit";
  formId: string;
  initialData?: AdsItem;
  onSubmit: (data: AdsFormFillable) => void;
  onFormChange?: (form: UseFormReturn<AdsFormFillable>) => void;
}

// Replace underscores with spaces and capitalize each word
const formatCategoryName = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const AdsForm = ({
  mode,
  formId,
  initialData,
  onSubmit,
  onFormChange,
}: AdsFormProps) => {
  const defaultValues: AdsFormFillable = useMemo(() => {
    if (mode === "edit" && initialData) {
      return {
        title: initialData.title || "",
        content: initialData.content || "",
        category: initialData.category || "INTERNAL",
        partner_name: initialData.partner_name || "",
        published: initialData.published || false,
        external_link: initialData.external_link || "",
      };
    }
    return {
      title: "",
      content: "",
      category: "INTERNAL",
      partner_name: "",
      published: false,
      external_link: "",
    };
  }, [initialData, mode]);

  const [externalCategory, setExternalCategory] = useState(false);

  const createAdsFormSchemaPlus = useMemo(() => {
    return adsSchema(externalCategory);
  }, [externalCategory]);

  const form = useForm<AdsFormFillable>({
    resolver: zodResolver(createAdsFormSchemaPlus),
    defaultValues,
  });

  useEffect(() => {
    setExternalCategory(form.watch("category") === "EXTERNAL");
  }, [form.watch("category")]);

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
                Upload ads image after saving
              </p>
            </div>
          )}

          {/* Ads Title Start */}
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
                    placeholder="Enter ads title"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Ads Title End */}

          {/* Ads Content Start */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="content">
                  <RequiredLabel>Content</RequiredLabel>
                </FormLabel>
                <FormControl>
                  <Textarea
                    id="content"
                    placeholder="Enter ads content"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Ads Content End */}

          {/* Ads Category Start*/}
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
                      <SelectValue placeholder="Select ads category" />
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
          {/* Ads Category End */}

          {/* Partner Name Start - Only show for EXTERNAL category */}
          {form.watch("category") === "EXTERNAL" && (
            <FormField
              control={form.control}
              name="partner_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="partner_name">
                    <RequiredLabel>Partner Name</RequiredLabel>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="partner_name"
                      placeholder="Enter partner name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Partner Name End - Only show for EXTERNAL category */}

          {/* Ads External Link Start */}
          <FormField
            control={form.control}
            name="external_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="external_link">
                  <RequiredLabel>External Link</RequiredLabel>
                </FormLabel>
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
          {/* Ads External Link End */}

          {/* Ads Published Start */}
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
          {/* Ads Published End */}
        </form>
      </Form>
    </div>
  );
};

export default AdsForm;
