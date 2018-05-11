import { RpcProvider } from "worker-rpc";
import * as jsonMap from "json-source-map";

const rpcProvider = new RpcProvider((message: any, transfer: any) => postMessage(message, transfer));

onmessage = e => rpcProvider.dispatch(e.data);

rpcProvider.registerRpcHandler("generateSourceMap", ({ obj }: any) => jsonMap.stringify(obj, null, 2));
