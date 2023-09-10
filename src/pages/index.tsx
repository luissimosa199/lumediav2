import dbConnect from '@/db/dbConnect'
import { PostModel } from '@/db/models'
import { PostFormInputs } from '@/types'
import { GetServerSideProps } from 'next'
import { ChangeEvent, FunctionComponent, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { QueryClient, dehydrate, useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '@/utils/getPosts'
import PrimaryForm from '@/components/PrimaryForm'

interface IndexProps {
  postData: PostFormInputs[];
}

const Index: FunctionComponent<IndexProps> = ({ postData }) => {

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<PostFormInputs[] | null>(null)

const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<PostFormInputs[]>(
  ['posts'],
  ({ pageParam = 0 }) => getPosts('posts', pageParam),
  {
    initialData: {
      pages: [postData],
      pageParams: [null]
    },    
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 0) return undefined;
      return allPages.length;
    },
  }
);

  const debouncedHandleSearchBar = debounce((value: string) => {
    setSearchValue(value);
  }, 300);

  const handleSearchBar = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    debouncedHandleSearchBar(event.target.value);
  };

  const handleSearch = async (value: string) => {
    const url = new URL('/api/post', window.location.origin);

    const valuesArray = value.split(' ')

    if (valuesArray.length > 1) {
      valuesArray.map(e => url.searchParams.append('tags', e))
    } else {
      url.searchParams.append('tags', value);
    }

    const response = await fetch(url, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch data');
    }
  };

  useEffect(() => {
    (async () => {
      if (searchValue) {
        try {
          const response = await handleSearch(searchValue);
          setSearchResult(response as PostFormInputs[]);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }, [searchValue]);

  return (
    <div>
      <div className="text-center max-w-[850px] mx-auto flex flex-col mb-4">
        <input placeholder="Buscar por categoría" className="border rounded p-2 mb-4" type="text" onChange={handleSearchBar} />
      </div>
      <PrimaryForm />
      
      <div className="mt-4 min-h-screen flex flex-col">

        {isError && <p>Error: {JSON.stringify(error)} </p>}

        {searchValue && Array.isArray(searchResult) && searchResult.length > 0 ? (
          searchResult.map((e) => (
            <div key={e._id} >
              <p>{e._id}</p>
            </div>
          ))
        ) : searchValue && Array.isArray(searchResult) && searchResult.length === 0 ? (
          <p className="text-center text-lg font-bold mt-4">No hay resultados</p>
        ) : (
          <>
            {data?.pages.map((page) =>
              page.map((e) => (
                <div key={e._id} className="mb-2 px-2 border-2">
                  <p>{e.title}</p>
                  <p>{e.text}</p>
                  <p>{e.authorId}</p>
                  <p>{e.createdAt}</p>
                  <p>{e.tags}</p>
                  <p>{JSON.stringify(e.photo)}</p>
                </div>
              ))
            )}
            
            {isLoading && <p className="w-full bg-slate-100 py-4 text-center">Cargando...</p>}
            {isError && <p>Error: {JSON.stringify(error)}</p>}
            {data && isFetchingNextPage && <p className="w-full bg-slate-100 py-4 text-center">Cargando...</p>}

            {data && hasNextPage && !isFetchingNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full bg-slate-100 py-4 mt-auto"
              >
                Ver más
              </button>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {

  const queryClient = new QueryClient();

  try {
    await dbConnect();

    const response = await PostModel.find({}).sort({ createdAt: -1 }).limit(10).lean();

    const postData = response.map((item) => ({
      _id: item._id,
      urlSlug: item.urlSlug || "",
      title: item.title,
      text: item.text,
      length: item.length,
      photo: item.photo,
      createdAt: item.createdAt.toISOString(),
      tags: item.tags || [],
      authorId: item.authorId || '',
      authorName: item.authorName || '',
      links: item.links,
    }));

    queryClient.setQueryData(['posts'], { pages: [postData], pageParams: [null] });


    return {
      props: {
        postData,
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        postData: [],
        dehydratedState: dehydrate(queryClient),
      },
    };
  }
};