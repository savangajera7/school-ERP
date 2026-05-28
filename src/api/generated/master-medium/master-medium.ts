import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { customInstance } from '../../../services/api/axiosInstance';
import type { MediumModel } from '../../model/mediumModel';

export const getApiMediumGet = (signal?: AbortSignal) => {
  return customInstance<any>('/api/Medium/Get', { method: 'GET', signal });
};

export const getGetApiMediumGetQueryKey = () => {
  return ['api', 'Medium', 'Get'] as const;
};

export const useGetApiMediumGet = <TData = Awaited<ReturnType<typeof getApiMediumGet>>, TError = unknown>(
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getApiMediumGet>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetApiMediumGetQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getApiMediumGet(signal);
  return useQuery<Awaited<ReturnType<typeof getApiMediumGet>>, TError, TData>({ queryKey, queryFn, ...queryOptions }) as any;
};

export const postApiMediumAdd = (mediumModel: MediumModel) => {
  return customInstance<any>('/api/Medium/Add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, data: mediumModel });
};

export const usePostApiMediumAdd = <TError = unknown, TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof postApiMediumAdd>>, TError, { data: MediumModel }, TContext> }) => {
  const { mutation: mutationOptions } = options ?? {};
  const mutationFn = (props: { data: MediumModel }) => {
    const { data } = props ?? {};
    return postApiMediumAdd(data);
  };
  return useMutation<Awaited<ReturnType<typeof postApiMediumAdd>>, TError, { data: MediumModel }, TContext>({ mutationFn, ...mutationOptions });
};

export const putApiMediumUpdate = (mediumModel: MediumModel) => {
  return customInstance<any>('/api/Medium/Update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, data: mediumModel });
};

export const usePutApiMediumUpdate = <TError = unknown, TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof putApiMediumUpdate>>, TError, { data: MediumModel }, TContext> }) => {
  const { mutation: mutationOptions } = options ?? {};
  const mutationFn = (props: { data: MediumModel }) => {
    const { data } = props ?? {};
    return putApiMediumUpdate(data);
  };
  return useMutation<Awaited<ReturnType<typeof putApiMediumUpdate>>, TError, { data: MediumModel }, TContext>({ mutationFn, ...mutationOptions });
};

export const deleteApiMediumDeleteId = (id: number) => {
  return customInstance<any>(`/api/Medium/Delete/${id}`, { method: 'DELETE' });
};

export const useDeleteApiMediumDeleteId = <TError = unknown, TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteApiMediumDeleteId>>, TError, { id: number }, TContext> }) => {
  const { mutation: mutationOptions } = options ?? {};
  const mutationFn = (props: { id: number }) => {
    const { id } = props ?? {};
    return deleteApiMediumDeleteId(id);
  };
  return useMutation<Awaited<ReturnType<typeof deleteApiMediumDeleteId>>, TError, { id: number }, TContext>({ mutationFn, ...mutationOptions });
};
