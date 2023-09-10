import { useQueryClient } from '@tanstack/react-query';
import { PostEntryData, PostFormInputs } from "@/types";
import { getCurrentDateTimeString } from "@/utils/formHelpers";
import { Session } from "next-auth";

interface OptimisticUpdateParams {
  data: Omit<PostFormInputs, "_id" | "createdAt">;
  images: string[];
}

interface Caption {
  idx: number;
  value: string;
}

const useOptimisticUpdate = (
  imagesCaption: Caption[],
  tagsList: string[],
  session: Session | null
) => {
  const queryClient = useQueryClient();

  return ({ data, images }: OptimisticUpdateParams) => {
    queryClient.cancelQueries(["timelines"]);

    const currentData = queryClient.getQueryData<{
      pages: PostFormInputs[][];
      pageParams: any[];
    }>(["timelines"]);

    const currentPhotos: PostEntryData[] = images.map(
      (image, photoIdx: number) => {
        const caption = imagesCaption.find((e) => e.idx === photoIdx)?.value;
        return {
          url: image,
          idx: photoIdx,
          caption: caption,
        };
      }
    );

    const newData: PostFormInputs = {
      _id: "newitem",
      createdAt: getCurrentDateTimeString(),
      text: data.text || "",
      photo: currentPhotos,
      length: currentPhotos.length,
      tags: tagsList,
      authorId: session?.user?.email ?? "defaultId",
      authorName: session?.user?.name ?? "defaultName",
      links: data.links,
    };

    if (currentData) {
      queryClient.setQueryData<{
        pages: PostFormInputs[][];
        pageParams: any[];
      }>(["timelines"], {
        ...currentData,
        pages: [
          [newData, ...currentData.pages[0]],
          ...currentData.pages.slice(1),
        ],
      });
    }

    return { previousData: currentData };
  };
};

export default useOptimisticUpdate;
