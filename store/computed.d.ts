export declare const computed: import("alo").ComputationValues<{
    tocItem: () => {
        id: number;
        title: string;
        path: string;
        hasContent: boolean;
        chapters: any;
    };
    parentTocItemIds: (obj: any) => number[];
    parentTocItems: (obj: any) => any;
    tocChapter: (obj: any) => any;
    viewableTocItems: (obj: any) => {
        id: number;
        title: string;
        path: string;
        hasContent: boolean;
        chapters: any;
    }[];
    readingProgress: (obj: any) => {
        firstEntry?: any;
        lastEntry?: any;
    };
}>;
