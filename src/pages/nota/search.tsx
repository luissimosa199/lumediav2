import dbConnect from '@/db/dbConnect'
import { PostModel } from '@/db/models'
import { PostFormInputs } from '@/types'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { FunctionComponent } from 'react'

interface SearchProps {
    postData: PostFormInputs[];
}

const Search: FunctionComponent<SearchProps> = ({ postData }) => {

    return (
        <>
            <div className="border flex justify-center items-center">
                <Link className="text-xs" href="/">Volver</Link>
            </div>

            <div>
                {postData && postData.length > 0 && postData.map((e) => {
                    return (
                        <div key={e._id}>
                            <p>{e._id}</p>
                        </div>
                    )
                })}
            </div>
        </>
    );
};

export default Search;

export const getServerSideProps: GetServerSideProps<SearchProps> = async (context: GetServerSidePropsContext) => {
    try {
        await dbConnect();

        const { tags } = context.query;

        const tagsArray = Array.isArray(tags) ? tags : [tags];

        const response = await PostModel.find({ tags: { $all: tagsArray } })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const postData = response.map((item) => ({
            _id: item._id,
            title: item.title || "",
            text: item.text,
            length: item.length,
            photo: item.photo,
            createdAt: item.createdAt.toISOString(),
            tags: item.tags || [],
            authorId: item.authorId || '',
            authorName: item.authorName || '',
            links: item.links || []
        }));

        return {
            props: {
                postData,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            props: {
                postData: [],
            },
        };
    }
};