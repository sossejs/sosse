import { Store } from "alo/store";
export declare const setConfig: (payload: any) => import("alo/store").NewActionWithPayload<any>;
export declare const toggleNavActive: () => import("alo/store").NewAction;
export declare const setNavActive: (payload: any) => import("alo/store").NewActionWithPayload<any>;
declare const store: Store<import("alo/store").Mutator<{
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
}>>;
export default store;
