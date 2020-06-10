import { Component, FunctionalComponent, FunctionComponent } from "preact";
export declare const observerHOC: <P = {}>(TheComponent: FunctionalComponent<P>) => FunctionComponent<P>;
export declare class Observer extends Component<{
    view?: any;
}> {
    updating: boolean;
    unobserve: any;
    renderedVnode: any;
    oldProps: any;
    oldState: any;
    startObserver(): void;
    observer: () => void;
    componentwillUnmount(): void;
    render(props: any, state: any): any;
}
