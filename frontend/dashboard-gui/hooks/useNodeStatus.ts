import useSWR from 'swr'
import { fetcher } from './fetcher';
import { NodeStatus } from '../model/node-status';

export const useNodeStatus = (): { nodeStatus: NodeStatus, startNode: () => void, stopNode: () => void, isLoading: boolean, isError: boolean } => {
  const {data, error, isLoading} = useSWR(`http://localhost:3001/api/node/status`, fetcher)

  const startNode = () => {
    fetch('http://localhost:3001/api/node/start', {method: 'POST'})
  }

  const stopNode = () => {
    fetch('http://localhost:3001/api/node/stop', {method: 'POST'})
  }

  return {
    nodeStatus: data,
    startNode,
    stopNode,
    isLoading: false,
    isError: false
  }
};
