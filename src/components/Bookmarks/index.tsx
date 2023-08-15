import { useQuery } from '@tanstack/react-query';
import { pinyin } from 'pinyin-pro';
import { useState } from 'react';
import browser from 'webextension-polyfill';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardHeader } from '@/components/ui/card';

export const Bookmarks = () => {
  const [search, setSearch] = useState('');
  const { data } = useQuery({
    queryKey: ['bookmarks', search],
    keepPreviousData: true,
    queryFn: async () => {
      const _bookmarks = await browser.bookmarks.getTree();
      // iterate over bookmarks and return a flat array of bookmarks
      const helperStack = [..._bookmarks];
      const bookmarks: browser.Bookmarks.BookmarkTreeNode[] = [];
      while (helperStack.length) {
        const node = helperStack.pop();
        if (node) {
          if (node.children) {
            helperStack.push(...node.children);
          } else {
            bookmarks.push(node);
          }
        }
      }
      return bookmarks;
    },
    select: (_data) => {
      return _data.filter((bookmark) => {
        const pinyinTitle = pinyin(bookmark.title, {
          separator: '',
          toneType: 'none',
        }).toLowerCase();
        const pinyinSearch = pinyin(search, {
          separator: '',
          toneType: 'none',
        }).toLowerCase();
        return (
          // 匹配拼音
          pinyinTitle.includes(pinyinSearch) ||
          // 匹配文字
          bookmark.title.includes(search) ||
          // 匹配链接
          bookmark.url?.includes(search) ||
          // 匹配链接搜索字符的拼音
          bookmark.url?.includes(pinyinSearch)
        );
      });
    },
  });

  const { data: histories } = useQuery({
    queryKey: ['history', search],
    keepPreviousData: true,
    queryFn: () => {
      return browser.history.search({
        text: search,
        maxResults: 50,
      });
    },
  });

  return (
    <div className="">
      <div className="sticky top-0 bg-white p-4 shadow">
        <Input
          autoFocus
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>
      <Tabs defaultValue="bookmark" className="mt-4 w-full text-center">
        <TabsList className="sticky top-20">
          <TabsTrigger value="bookmark">Bookmarks</TabsTrigger>
          <TabsTrigger value="history">Histories</TabsTrigger>
        </TabsList>
        <TabsContent value="bookmark">
          {data?.map((bookmarkItem) => (
            <Card className="m-4 transition-colors hover:bg-muted/50" key={bookmarkItem.id}>
              <a href={bookmarkItem.url} target="_blank" rel="noreferrer">
                <CardHeader title={bookmarkItem.url} className="text-sm font-medium">
                  {bookmarkItem.title}
                </CardHeader>
              </a>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="history">
          {histories?.map((historyItem) => (
            <Card className="m-4 transition-colors hover:bg-muted/50" key={historyItem.id}>
              <a href={historyItem.url} target="_blank" rel="noreferrer">
                <CardHeader title={historyItem.url} className="text-sm font-medium">
                  {historyItem.title}
                </CardHeader>
              </a>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
