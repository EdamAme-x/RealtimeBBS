import { sha256 } from './crypto.ts';
export const equal = (a, b)=>{
    if (a === b) {
        return true;
    }
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    const va = new DataView(a);
    const vb = new DataView(b);
    let i = va.byteLength;
    while(i--){
        if (va.getUint8(i) !== vb.getUint8(i)) {
            return false;
        }
    }
    return true;
};
export const timingSafeEqual = async (a, b, hashFunction)=>{
    if (!hashFunction) {
        hashFunction = sha256;
    }
    const sa = await hashFunction(a);
    const sb = await hashFunction(b);
    if (!sa || !sb) {
        return false;
    }
    return sa === sb && a === b;
};
export const bufferToString = (buffer)=>{
    if (buffer instanceof ArrayBuffer) {
        const enc = new TextDecoder('utf-8');
        return enc.decode(buffer);
    }
    return buffer;
};
export const bufferToFormData = (arrayBuffer, contentType)=>{
    const response = new Response(arrayBuffer, {
        headers: {
            'Content-Type': contentType
        }
    });
    return response.formData();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvYnVmZmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNoYTI1NiB9IGZyb20gJy4vY3J5cHRvLnRzJ1xuXG5leHBvcnQgY29uc3QgZXF1YWwgPSAoYTogQXJyYXlCdWZmZXIsIGI6IEFycmF5QnVmZmVyKSA9PiB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpZiAoYS5ieXRlTGVuZ3RoICE9PSBiLmJ5dGVMZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IHZhID0gbmV3IERhdGFWaWV3KGEpXG4gIGNvbnN0IHZiID0gbmV3IERhdGFWaWV3KGIpXG5cbiAgbGV0IGkgPSB2YS5ieXRlTGVuZ3RoXG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZiAodmEuZ2V0VWludDgoaSkgIT09IHZiLmdldFVpbnQ4KGkpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQgY29uc3QgdGltaW5nU2FmZUVxdWFsID0gYXN5bmMgKFxuICBhOiBzdHJpbmcgfCBvYmplY3QgfCBib29sZWFuLFxuICBiOiBzdHJpbmcgfCBvYmplY3QgfCBib29sZWFuLFxuICBoYXNoRnVuY3Rpb24/OiBGdW5jdGlvblxuKSA9PiB7XG4gIGlmICghaGFzaEZ1bmN0aW9uKSB7XG4gICAgaGFzaEZ1bmN0aW9uID0gc2hhMjU2XG4gIH1cblxuICBjb25zdCBzYSA9IGF3YWl0IGhhc2hGdW5jdGlvbihhKVxuICBjb25zdCBzYiA9IGF3YWl0IGhhc2hGdW5jdGlvbihiKVxuXG4gIGlmICghc2EgfHwgIXNiKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gc2EgPT09IHNiICYmIGEgPT09IGJcbn1cblxuZXhwb3J0IGNvbnN0IGJ1ZmZlclRvU3RyaW5nID0gKGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBzdHJpbmcgPT4ge1xuICBpZiAoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dERlY29kZXIoJ3V0Zi04JylcbiAgICByZXR1cm4gZW5jLmRlY29kZShidWZmZXIpXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5leHBvcnQgY29uc3QgYnVmZmVyVG9Gb3JtRGF0YSA9IChhcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXIsIGNvbnRlbnRUeXBlOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoYXJyYXlCdWZmZXIsIHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogY29udGVudFR5cGUsXG4gICAgfSxcbiAgfSlcbiAgcmV0dXJuIHJlc3BvbnNlLmZvcm1EYXRhKClcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE1BQU0sUUFBUSxjQUFhO0FBRXBDLE9BQU8sTUFBTSxRQUFRLENBQUMsR0FBZ0IsSUFBbUI7SUFDdkQsSUFBSSxNQUFNLEdBQUc7UUFDWCxPQUFPLElBQUk7SUFDYixDQUFDO0lBQ0QsSUFBSSxFQUFFLFVBQVUsS0FBSyxFQUFFLFVBQVUsRUFBRTtRQUNqQyxPQUFPLEtBQUs7SUFDZCxDQUFDO0lBRUQsTUFBTSxLQUFLLElBQUksU0FBUztJQUN4QixNQUFNLEtBQUssSUFBSSxTQUFTO0lBRXhCLElBQUksSUFBSSxHQUFHLFVBQVU7SUFDckIsTUFBTyxJQUFLO1FBQ1YsSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUk7WUFDckMsT0FBTyxLQUFLO1FBQ2QsQ0FBQztJQUNIO0lBRUEsT0FBTyxJQUFJO0FBQ2IsRUFBQztBQUVELE9BQU8sTUFBTSxrQkFBa0IsT0FDN0IsR0FDQSxHQUNBLGVBQ0c7SUFDSCxJQUFJLENBQUMsY0FBYztRQUNqQixlQUFlO0lBQ2pCLENBQUM7SUFFRCxNQUFNLEtBQUssTUFBTSxhQUFhO0lBQzlCLE1BQU0sS0FBSyxNQUFNLGFBQWE7SUFFOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ2QsT0FBTyxLQUFLO0lBQ2QsQ0FBQztJQUVELE9BQU8sT0FBTyxNQUFNLE1BQU07QUFDNUIsRUFBQztBQUVELE9BQU8sTUFBTSxpQkFBaUIsQ0FBQyxTQUFnQztJQUM3RCxJQUFJLGtCQUFrQixhQUFhO1FBQ2pDLE1BQU0sTUFBTSxJQUFJLFlBQVk7UUFDNUIsT0FBTyxJQUFJLE1BQU0sQ0FBQztJQUNwQixDQUFDO0lBQ0QsT0FBTztBQUNULEVBQUM7QUFFRCxPQUFPLE1BQU0sbUJBQW1CLENBQUMsYUFBMEIsY0FBd0I7SUFDakYsTUFBTSxXQUFXLElBQUksU0FBUyxhQUFhO1FBQ3pDLFNBQVM7WUFDUCxnQkFBZ0I7UUFDbEI7SUFDRjtJQUNBLE9BQU8sU0FBUyxRQUFRO0FBQzFCLEVBQUMifQ==