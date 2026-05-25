/**
 * Classroom content (Homework, Classwork, Notebook) — stored via Notice API until dedicated endpoints exist.
 * Title prefix: [HOMEWORK], [CLASSWORK], [NOTEBOOK]
 */
import {
  useGetApiNoticeGetNoticeList,
  usePostApiNoticeInsertNotice,
} from "@/api/generated/notice/notice";
import { parseApiList } from "@/utils/apiResponse";

export type ContentKind = "HOMEWORK" | "CLASSWORK" | "NOTEBOOK";

const PREFIX: Record<ContentKind, string> = {
  HOMEWORK: "[HOMEWORK]",
  CLASSWORK: "[CLASSWORK]",
  NOTEBOOK: "[NOTEBOOK]",
};

export function parseContentNotice(item: Record<string, unknown>) {
  const title = String(item.noticeTitle ?? "");
  let kind: ContentKind | null = null;
  for (const k of Object.keys(PREFIX) as ContentKind[]) {
    if (title.startsWith(PREFIX[k])) {
      kind = k;
      break;
    }
  }
  const cleanTitle = kind
    ? title.replace(PREFIX[kind], "").trim()
    : title;
  return {
    id: String(item.noticeID ?? item.id ?? ""),
    kind,
    title: cleanTitle,
    body: String(item.noticeDescription ?? ""),
    date: String(item.startDate ?? item.publishDate ?? ""),
    raw: item,
  };
}

export function buildContentTitle(kind: ContentKind, title: string) {
  return `${PREFIX[kind]} ${title}`.trim();
}

export function useClassroomContentList(kind?: ContentKind) {
  const q = useGetApiNoticeGetNoticeList();
  const items = parseApiList<Record<string, unknown>>(q.data?.data)
    .map(parseContentNotice)
    .filter((x) => (kind ? x.kind === kind : !!x.kind));
  return { ...q, items };
}

export function useInsertClassroomContent() {
  return usePostApiNoticeInsertNotice();
}
