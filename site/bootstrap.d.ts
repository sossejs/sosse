import "./vendor";
import "./assets/css/app.scss";
import "./store/router";
export declare class App {
    mainWrapperRef: import("preact").RefObject<any>;
    constructor(appEl: any, config: any);
    initStores(appEl: any, config: any): Promise<void>;
    setActiveChapterByLocationHash(): import("alo/store").Action;
    focusElementByHash(hash: any): void;
    gotoPrevTocItem(): Promise<void>;
    onClickMobileNavPrev: (evt: any) => Promise<void>;
    onClickNavPrev: (evt: any) => Promise<void>;
    gotoNextTocItem(): Promise<void>;
    onClickMobileNavNext: (evt: any) => Promise<void>;
    onClickNavNext: (evt: any) => Promise<void>;
    gotoChapter(chapter: any): void;
    getPreviousItemId(idxMove?: number): number;
    getNextItemId(): number;
    getPreviousChapterId(item: any, idxMove?: number): number | false;
    getNextChapterId(item: any): number | false;
}
