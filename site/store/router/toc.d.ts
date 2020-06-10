export declare const setTocItemId: (id: any, computed: any, resetChapterId?: boolean, body?: any) => (ds: import("alo/store").StoreDispatchApi<any>) => Promise<import("alo/store").Action>;
export declare const setTocItemContent: (content: any) => {
    type: string;
    payload: {
        content: any;
    };
};
export declare const setTocChapterId: (id: any) => {
    type: string;
    payload: {
        id: any;
    };
};
export declare const initToc: (items: any, root: any) => Promise<{
    type: string;
    payload: {
        items: any;
        root: any;
        itemId: any;
        chapterId: number;
        itemContent: any;
    };
}>;
export declare const reduceToc: (state: any, action: any) => any;
export declare const getTocItemById: (id: any, items?: any) => any;
export declare const getTocItemsById: (itemIds: any) => any;
