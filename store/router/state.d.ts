declare type Item = {
    id: number;
    title: string;
    path: string;
    hasContent: boolean;
    chapters: any;
};
export declare const createState: () => {
    rootUrl: string;
    toc: {
        items: Item[];
        root: any[];
        itemId: number;
        chapterId: number;
        itemContent: string;
    };
};
export {};
