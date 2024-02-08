import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

import {
  Entry,
  EntryField,
  EntryFieldTypes,
  EntryFields,
  EntrySkeletonType,
  createClient,
} from "contentful";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

type PageSlugSkeleton = EntrySkeletonType<
  { slug: EntryFieldTypes.Symbol },
  "pageSlug"
>;
type PageSlug = Entry<PageSlugSkeleton, "WITHOUT_UNRESOLVABLE_LINKS">;
type PageSkeleton = EntrySkeletonType<
  {
    slug: EntryFieldTypes.EntryLink<PageSlugSkeleton>;
    seoTitle: EntryFields.Symbol;
  },
  "pageGlobalPage"
>;

type Page = Entry<PageSkeleton, "WITHOUT_UNRESOLVABLE_LINKS">;

export default function Home({ page }: { page: Page }) {
  const updatedPage = useContentfulLiveUpdates(page);

  console.log("slug fields", updatedPage.fields.slug);

  return (
    <>
      <p>Slug: {updatedPage.fields.slug?.fields.slug}</p>
      <p>SEO Title: {updatedPage.fields.seoTitle}</p>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ id: string }>
) => {
  if (!process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN) {
    throw Error("CONTENTFUL_ACCESS_TOKEN is not set");
  }

  const client = createClient({
    space: "23u853certza",
    accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    host: "preview.contentful.com",
  }).withoutUnresolvableLinks;

  if (!context.params) {
    throw Error("no params");
  }

  console.log(context.params);

  const page = await client.getEntry<PageSkeleton>(context.params.id);

  if (!page) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      page,
    },
  };
};
