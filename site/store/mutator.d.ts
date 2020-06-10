import { Mutator } from "alo/store";
export declare const mutator: Mutator<{
    localMode: boolean;
    navActive: boolean;
    config: {
        colors: any;
        title: string;
        footer: any;
    };
    router: {
        rootUrl: string;
        toc: {
            items: {
                id: number;
                title: string;
                path: string;
                hasContent: boolean;
                chapters: any;
            }[];
            root: any[];
            itemId: number;
            chapterId: number;
            itemContent: string;
        };
    };
}>;
