/**
 * Classroom content (Homework, Classwork, Notebook) — stored via Notice API until dedicated endpoints exist.
 * Title prefix: [HOMEWORK], [CLASSWORK], [NOTEBOOK]
 */
import { useGetApiNoticeGet, usePostApiNoticeAdd } from "@/api/generated/8-notice/8-notice";
import { useGetApiHomeworkGet, usePostApiHomeworkAdd } from "@/api/generated/5-homework-tracking/5-homework-tracking";
import { useGetApiClassworkGet, usePostApiClassworkAdd } from "@/api/generated/7-classwork/7-classwork";
import { parseApiList } from "@/utils/apiResponse";

export type ContentKind = "HOMEWORK" | "CLASSWORK" | "NOTEBOOK";

const PREFIX: Record<ContentKind, string> = {
  HOMEWORK: "[HOMEWORK]",
  CLASSWORK: "[CLASSWORK]",
  NOTEBOOK: "[NOTEBOOK]",
};

export function buildContentTitle(kind: ContentKind, title: string) {
  return `${PREFIX[kind]} ${title}`.trim();
}

export function useClassroomContentList(kind: ContentKind) {
  const noticeQuery = useGetApiNoticeGet(undefined, { query: { enabled: kind === "NOTEBOOK" } });
  const homeworkQuery = useGetApiHomeworkGet(undefined, { query: { enabled: kind === "HOMEWORK" } });
  const classworkQuery = useGetApiClassworkGet(undefined, { query: { enabled: kind === "CLASSWORK" } });

  let rawData: any[] = [];
  let isLoading = false;
  let isError = false;
  let error: any = null;
  let refetch: () => void = () => {};

  if (kind === "HOMEWORK") {
    rawData = parseApiList<any>(homeworkQuery.data?.data);
    isLoading = homeworkQuery.isLoading;
    isError = homeworkQuery.isError;
    error = homeworkQuery.error;
    refetch = homeworkQuery.refetch;
  } else if (kind === "CLASSWORK") {
    rawData = parseApiList<any>(classworkQuery.data?.data);
    isLoading = classworkQuery.isLoading;
    isError = classworkQuery.isError;
    error = classworkQuery.error;
    refetch = classworkQuery.refetch;
  } else {
    rawData = parseApiList<any>(noticeQuery.data?.data);
    isLoading = noticeQuery.isLoading;
    isError = noticeQuery.isError;
    error = noticeQuery.error;
    refetch = noticeQuery.refetch;
  }

  const items = rawData.map(item => ({
    id: String(item.id ?? item.homeworkID ?? item.classworkID ?? item.noticeID ?? ""),
    kind,
    title: String(item.title ?? item.homeworkTitle ?? item.classworkTitle ?? item.noticeTitle ?? "").replace(PREFIX[kind], "").trim(),
    body: String(item.description ?? item.homeworkDescription ?? item.classworkDescription ?? item.noticeDescription ?? ""),
    date: String(item.date ?? item.homeworkDate ?? item.classworkDate ?? item.noticeDate ?? item.startDate ?? item.publishDate ?? ""),
    raw: item,
  }));

  return { items, isLoading, isError, error, refetch };
}

export function useInsertClassroomContent(kind: ContentKind) {
  const noticeMut = usePostApiNoticeAdd();
  const homeworkMut = usePostApiHomeworkAdd();
  const classworkMut = usePostApiClassworkAdd();

  return {
    isPending: noticeMut.isPending || homeworkMut.isPending || classworkMut.isPending,
    mutateAsync: async ({ data }: any) => {
      if (kind === "HOMEWORK") {
        return homeworkMut.mutateAsync({ data: {
          homeworkTitle: data.noticeTitle,
          homeworkDescription: data.noticeDescription,
          homeworkDate: data.startDate || new Date().toISOString().split("T")[0],
          classID: data.classIDs ? data.classIDs[0] : 1,
          subjectID: data.subjectID || 1,
          addedBy: data.addedBy,
        } as any });
      } else if (kind === "CLASSWORK") {
        return classworkMut.mutateAsync({ data: {
          classworkTitle: data.noticeTitle,
          classworkDescription: data.noticeDescription,
          classworkDate: data.startDate || new Date().toISOString().split("T")[0],
          classID: data.classIDs ? data.classIDs[0] : 1,
          subjectID: data.subjectID || 1,
          addedBy: data.addedBy,
        } as any });
      } else {
        return noticeMut.mutateAsync({ data });
      }
    }
  };
}
