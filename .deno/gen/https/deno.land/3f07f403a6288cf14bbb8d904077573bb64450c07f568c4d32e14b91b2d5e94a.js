import { getCookie } from '../helper/cookie/index.ts';
import { bufferToFormData } from '../utils/buffer.ts';
export const validator = (target, validationFunc)=>{
    return async (c, next)=>{
        let value = {};
        switch(target){
            case 'json':
                try {
                    const contentType = c.req.header('Content-Type');
                    if (!contentType || !contentType.startsWith('application/json')) {
                        throw new Error(`Invalid HTTP header: Content-Type=${contentType}`);
                    }
                    /**
           * Get the arrayBuffer first, create JSON object via Response,
           * and cache the arrayBuffer in the c.req.bodyCache.
           */ const arrayBuffer = c.req.bodyCache.arrayBuffer ?? await c.req.raw.arrayBuffer();
                    value = await new Response(arrayBuffer).json();
                    c.req.bodyCache.json = value;
                    c.req.bodyCache.arrayBuffer = arrayBuffer;
                } catch  {
                    console.error('Error: Malformed JSON in request body');
                    return c.json({
                        success: false,
                        message: 'Malformed JSON in request body'
                    }, 400);
                }
                break;
            case 'form':
                {
                    try {
                        const contentType = c.req.header('Content-Type');
                        if (contentType) {
                            const arrayBuffer = c.req.bodyCache.arrayBuffer ?? await c.req.raw.arrayBuffer();
                            const formData = await bufferToFormData(arrayBuffer, contentType);
                            const form = {};
                            formData.forEach((value, key)=>{
                                form[key] = value;
                            });
                            value = form;
                            c.req.bodyCache.formData = formData;
                            c.req.bodyCache.arrayBuffer = arrayBuffer;
                        }
                    } catch (e) {
                        let message = 'Malformed FormData request.';
                        message += e instanceof Error ? ` ${e.message}` : ` ${String(e)}`;
                        return c.json({
                            success: false,
                            message
                        }, 400);
                    }
                    break;
                }
            case 'query':
                value = Object.fromEntries(Object.entries(c.req.queries()).map(([k, v])=>{
                    return v.length === 1 ? [
                        k,
                        v[0]
                    ] : [
                        k,
                        v
                    ];
                }));
                break;
            case 'queries':
                value = c.req.queries();
                console.log('Warnings: Validate type `queries` is deprecated. Use `query` instead.');
                break;
            case 'param':
                value = c.req.param();
                break;
            case 'header':
                value = c.req.header();
                break;
            case 'cookie':
                value = getCookie(c);
                break;
        }
        const res = await validationFunc(value, c);
        if (res instanceof Response) {
            return res;
        }
        c.req.addValidatedData(target, res);
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdmFsaWRhdG9yL3ZhbGlkYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICcuLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi4vaGVscGVyL2Nvb2tpZS9pbmRleC50cydcbmltcG9ydCB0eXBlIHsgRW52LCBWYWxpZGF0aW9uVGFyZ2V0cywgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi90eXBlcy50cydcbmltcG9ydCB0eXBlIHsgQm9keURhdGEgfSBmcm9tICcuLi91dGlscy9ib2R5LnRzJ1xuaW1wb3J0IHsgYnVmZmVyVG9Gb3JtRGF0YSB9IGZyb20gJy4uL3V0aWxzL2J1ZmZlci50cydcblxudHlwZSBWYWxpZGF0aW9uVGFyZ2V0S2V5c1dpdGhCb2R5ID0gJ2Zvcm0nIHwgJ2pzb24nXG50eXBlIFZhbGlkYXRpb25UYXJnZXRCeU1ldGhvZDxNPiA9IE0gZXh0ZW5kcyAnZ2V0JyB8ICdoZWFkJyAvLyBHRVQgYW5kIEhFQUQgcmVxdWVzdCBtdXN0IG5vdCBoYXZlIGEgYm9keSBjb250ZW50LlxuICA/IEV4Y2x1ZGU8a2V5b2YgVmFsaWRhdGlvblRhcmdldHMsIFZhbGlkYXRpb25UYXJnZXRLZXlzV2l0aEJvZHk+XG4gIDoga2V5b2YgVmFsaWRhdGlvblRhcmdldHNcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGlvbkZ1bmN0aW9uPFxuICBJbnB1dFR5cGUsXG4gIE91dHB1dFR5cGUsXG4gIEUgZXh0ZW5kcyBFbnYgPSB7fSxcbiAgUCBleHRlbmRzIHN0cmluZyA9IHN0cmluZ1xuPiA9IChcbiAgdmFsdWU6IElucHV0VHlwZSxcbiAgYzogQ29udGV4dDxFLCBQPlxuKSA9PiBPdXRwdXRUeXBlIHwgUmVzcG9uc2UgfCBQcm9taXNlPE91dHB1dFR5cGU+IHwgUHJvbWlzZTxSZXNwb25zZT5cblxuZXhwb3J0IGNvbnN0IHZhbGlkYXRvciA9IDxcbiAgSW5wdXRUeXBlLFxuICBQIGV4dGVuZHMgc3RyaW5nLFxuICBNIGV4dGVuZHMgc3RyaW5nLFxuICBVIGV4dGVuZHMgVmFsaWRhdGlvblRhcmdldEJ5TWV0aG9kPE0+LFxuICBPdXRwdXRUeXBlID0gVmFsaWRhdGlvblRhcmdldHNbVV0sXG4gIFAyIGV4dGVuZHMgc3RyaW5nID0gUCxcbiAgViBleHRlbmRzIHtcbiAgICBpbjogeyBbSyBpbiBVXTogdW5rbm93biBleHRlbmRzIElucHV0VHlwZSA/IE91dHB1dFR5cGUgOiBJbnB1dFR5cGUgfVxuICAgIG91dDogeyBbSyBpbiBVXTogT3V0cHV0VHlwZSB9XG4gIH0gPSB7XG4gICAgaW46IHsgW0sgaW4gVV06IHVua25vd24gZXh0ZW5kcyBJbnB1dFR5cGUgPyBPdXRwdXRUeXBlIDogSW5wdXRUeXBlIH1cbiAgICBvdXQ6IHsgW0sgaW4gVV06IE91dHB1dFR5cGUgfVxuICB9LFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBFIGV4dGVuZHMgRW52ID0gYW55XG4+KFxuICB0YXJnZXQ6IFUsXG4gIHZhbGlkYXRpb25GdW5jOiBWYWxpZGF0aW9uRnVuY3Rpb248XG4gICAgdW5rbm93biBleHRlbmRzIElucHV0VHlwZSA/IFZhbGlkYXRpb25UYXJnZXRzW1VdIDogSW5wdXRUeXBlLFxuICAgIE91dHB1dFR5cGUsXG4gICAgRSxcbiAgICBQMlxuICA+XG4pOiBNaWRkbGV3YXJlSGFuZGxlcjxFLCBQLCBWPiA9PiB7XG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHt9XG5cbiAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSBjLnJlcS5oZWFkZXIoJ0NvbnRlbnQtVHlwZScpXG4gICAgICAgICAgaWYgKCFjb250ZW50VHlwZSB8fCAhY29udGVudFR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgSFRUUCBoZWFkZXI6IENvbnRlbnQtVHlwZT0ke2NvbnRlbnRUeXBlfWApXG4gICAgICAgICAgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEdldCB0aGUgYXJyYXlCdWZmZXIgZmlyc3QsIGNyZWF0ZSBKU09OIG9iamVjdCB2aWEgUmVzcG9uc2UsXG4gICAgICAgICAgICogYW5kIGNhY2hlIHRoZSBhcnJheUJ1ZmZlciBpbiB0aGUgYy5yZXEuYm9keUNhY2hlLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYy5yZXEuYm9keUNhY2hlLmFycmF5QnVmZmVyID8/IChhd2FpdCBjLnJlcS5yYXcuYXJyYXlCdWZmZXIoKSlcbiAgICAgICAgICB2YWx1ZSA9IGF3YWl0IG5ldyBSZXNwb25zZShhcnJheUJ1ZmZlcikuanNvbigpXG4gICAgICAgICAgYy5yZXEuYm9keUNhY2hlLmpzb24gPSB2YWx1ZVxuICAgICAgICAgIGMucmVxLmJvZHlDYWNoZS5hcnJheUJ1ZmZlciA9IGFycmF5QnVmZmVyXG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOiBNYWxmb3JtZWQgSlNPTiBpbiByZXF1ZXN0IGJvZHknKVxuICAgICAgICAgIHJldHVybiBjLmpzb24oXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICBtZXNzYWdlOiAnTWFsZm9ybWVkIEpTT04gaW4gcmVxdWVzdCBib2R5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA0MDBcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2Zvcm0nOiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSBjLnJlcS5oZWFkZXIoJ0NvbnRlbnQtVHlwZScpXG4gICAgICAgICAgaWYgKGNvbnRlbnRUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IGMucmVxLmJvZHlDYWNoZS5hcnJheUJ1ZmZlciA/PyAoYXdhaXQgYy5yZXEucmF3LmFycmF5QnVmZmVyKCkpXG4gICAgICAgICAgICBjb25zdCBmb3JtRGF0YSA9IGF3YWl0IGJ1ZmZlclRvRm9ybURhdGEoYXJyYXlCdWZmZXIsIGNvbnRlbnRUeXBlKVxuICAgICAgICAgICAgY29uc3QgZm9ybTogQm9keURhdGEgPSB7fVxuICAgICAgICAgICAgZm9ybURhdGEuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgICBmb3JtW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHZhbHVlID0gZm9ybVxuICAgICAgICAgICAgYy5yZXEuYm9keUNhY2hlLmZvcm1EYXRhID0gZm9ybURhdGFcbiAgICAgICAgICAgIGMucmVxLmJvZHlDYWNoZS5hcnJheUJ1ZmZlciA9IGFycmF5QnVmZmVyXG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnTWFsZm9ybWVkIEZvcm1EYXRhIHJlcXVlc3QuJ1xuICAgICAgICAgIG1lc3NhZ2UgKz0gZSBpbnN0YW5jZW9mIEVycm9yID8gYCAke2UubWVzc2FnZX1gIDogYCAke1N0cmluZyhlKX1gXG4gICAgICAgICAgcmV0dXJuIGMuanNvbihcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgNDAwXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlICdxdWVyeSc6XG4gICAgICAgIHZhbHVlID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGMucmVxLnF1ZXJpZXMoKSkubWFwKChbaywgdl0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2Lmxlbmd0aCA9PT0gMSA/IFtrLCB2WzBdXSA6IFtrLCB2XVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3F1ZXJpZXMnOlxuICAgICAgICB2YWx1ZSA9IGMucmVxLnF1ZXJpZXMoKVxuICAgICAgICBjb25zb2xlLmxvZygnV2FybmluZ3M6IFZhbGlkYXRlIHR5cGUgYHF1ZXJpZXNgIGlzIGRlcHJlY2F0ZWQuIFVzZSBgcXVlcnlgIGluc3RlYWQuJylcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3BhcmFtJzpcbiAgICAgICAgdmFsdWUgPSBjLnJlcS5wYXJhbSgpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2hlYWRlcic6XG4gICAgICAgIHZhbHVlID0gYy5yZXEuaGVhZGVyKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2Nvb2tpZSc6XG4gICAgICAgIHZhbHVlID0gZ2V0Q29va2llKGMpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgY29uc3QgcmVzID0gYXdhaXQgdmFsaWRhdGlvbkZ1bmModmFsdWUgYXMgbmV2ZXIsIGMgYXMgbmV2ZXIpXG5cbiAgICBpZiAocmVzIGluc3RhbmNlb2YgUmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICBjLnJlcS5hZGRWYWxpZGF0ZWREYXRhKHRhcmdldCwgcmVzIGFzIG5ldmVyKVxuXG4gICAgYXdhaXQgbmV4dCgpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLFNBQVMsUUFBUSw0QkFBMkI7QUFHckQsU0FBUyxnQkFBZ0IsUUFBUSxxQkFBb0I7QUFpQnJELE9BQU8sTUFB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