import { decodeURIComponent_ } from './url.ts';
const algorithm = {
    name: 'HMAC',
    hash: 'SHA-256'
};
const getCryptoKey = async (secret)=>{
    const secretBuf = typeof secret === 'string' ? new TextEncoder().encode(secret) : secret;
    return await crypto.subtle.importKey('raw', secretBuf, algorithm, false, [
        'sign',
        'verify'
    ]);
};
const makeSignature = async (value, secret)=>{
    const key = await getCryptoKey(secret);
    const signature = await crypto.subtle.sign(algorithm.name, key, new TextEncoder().encode(value));
    // the returned base64 encoded signature will always be 44 characters long and end with one or two equal signs
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
};
const verifySignature = async (base64Signature, value, secret)=>{
    try {
        const signatureBinStr = atob(base64Signature);
        const signature = new Uint8Array(signatureBinStr.length);
        for(let i = 0; i < signatureBinStr.length; i++)signature[i] = signatureBinStr.charCodeAt(i);
        return await crypto.subtle.verify(algorithm, secret, signature, new TextEncoder().encode(value));
    } catch (e) {
        return false;
    }
};
// all alphanumeric chars and all of _!#$%&'*.^`|~+-
// (see: https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1)
const validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
// all ASCII chars 32-126 except 34, 59, and 92 (i.e. space to tilde but not double quote, semicolon, or backslash)
// (see: https://datatracker.ietf.org/doc/html/rfc6265#section-4.1.1)
//
// note: the spec also prohibits comma and space, but we allow both since they are very common in the real world
// (see: https://github.com/golang/go/issues/7243)
const validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
export const parse = (cookie, name)=>{
    const pairs = cookie.trim().split(';');
    return pairs.reduce((parsedCookie, pairStr)=>{
        pairStr = pairStr.trim();
        const valueStartPos = pairStr.indexOf('=');
        if (valueStartPos === -1) return parsedCookie;
        const cookieName = pairStr.substring(0, valueStartPos).trim();
        if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) return parsedCookie;
        let cookieValue = pairStr.substring(valueStartPos + 1).trim();
        if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1, -1);
        if (validCookieValueRegEx.test(cookieValue)) parsedCookie[cookieName] = decodeURIComponent_(cookieValue);
        return parsedCookie;
    }, {});
};
export const parseSigned = async (cookie, secret, name)=>{
    const parsedCookie = {};
    const secretKey = await getCryptoKey(secret);
    for (const [key, value] of Object.entries(parse(cookie, name))){
        const signatureStartPos = value.lastIndexOf('.');
        if (signatureStartPos < 1) continue;
        const signedValue = value.substring(0, signatureStartPos);
        const signature = value.substring(signatureStartPos + 1);
        if (signature.length !== 44 || !signature.endsWith('=')) continue;
        const isVerified = await verifySignature(signature, signedValue, secretKey);
        parsedCookie[key] = isVerified ? signedValue : false;
    }
    return parsedCookie;
};
const _serialize = (name, value, opt = {})=>{
    let cookie = `${name}=${value}`;
    if (opt && typeof opt.maxAge === 'number' && opt.maxAge >= 0) {
        cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
    }
    if (opt.domain) {
        cookie += `; Domain=${opt.domain}`;
    }
    if (opt.path) {
        cookie += `; Path=${opt.path}`;
    }
    if (opt.expires) {
        cookie += `; Expires=${opt.expires.toUTCString()}`;
    }
    if (opt.httpOnly) {
        cookie += '; HttpOnly';
    }
    if (opt.secure) {
        cookie += '; Secure';
    }
    if (opt.sameSite) {
        cookie += `; SameSite=${opt.sameSite}`;
    }
    if (opt.partitioned) {
        cookie += '; Partitioned';
    }
    return cookie;
};
export const serialize = (name, value, opt = {})=>{
    value = encodeURIComponent(value);
    return _serialize(name, value, opt);
};
export const serializeSigned = async (name, value, secret, opt = {})=>{
    const signature = await makeSignature(value, secret);
    value = `${value}.${signature}`;
    value = encodeURIComponent(value);
    return _serialize(name, value, opt);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvY29va2llLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlY29kZVVSSUNvbXBvbmVudF8gfSBmcm9tICcuL3VybC50cydcblxuZXhwb3J0IHR5cGUgQ29va2llID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuZXhwb3J0IHR5cGUgU2lnbmVkQ29va2llID0gUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgZmFsc2U+XG5leHBvcnQgdHlwZSBDb29raWVPcHRpb25zID0ge1xuICBkb21haW4/OiBzdHJpbmdcbiAgZXhwaXJlcz86IERhdGVcbiAgaHR0cE9ubHk/OiBib29sZWFuXG4gIG1heEFnZT86IG51bWJlclxuICBwYXRoPzogc3RyaW5nXG4gIHNlY3VyZT86IGJvb2xlYW5cbiAgc2lnbmluZ1NlY3JldD86IHN0cmluZ1xuICBzYW1lU2l0ZT86ICdTdHJpY3QnIHwgJ0xheCcgfCAnTm9uZSdcbiAgcGFydGl0aW9uZWQ/OiBib29sZWFuXG59XG5cbmNvbnN0IGFsZ29yaXRobSA9IHsgbmFtZTogJ0hNQUMnLCBoYXNoOiAnU0hBLTI1NicgfVxuXG5jb25zdCBnZXRDcnlwdG9LZXkgPSBhc3luYyAoc2VjcmV0OiBzdHJpbmcgfCBCdWZmZXJTb3VyY2UpOiBQcm9taXNlPENyeXB0b0tleT4gPT4ge1xuICBjb25zdCBzZWNyZXRCdWYgPSB0eXBlb2Ygc2VjcmV0ID09PSAnc3RyaW5nJyA/IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZWNyZXQpIDogc2VjcmV0XG4gIHJldHVybiBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleSgncmF3Jywgc2VjcmV0QnVmLCBhbGdvcml0aG0sIGZhbHNlLCBbJ3NpZ24nLCAndmVyaWZ5J10pXG59XG5cbmNvbnN0IG1ha2VTaWduYXR1cmUgPSBhc3luYyAodmFsdWU6IHN0cmluZywgc2VjcmV0OiBzdHJpbmcgfCBCdWZmZXJTb3VyY2UpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBrZXkgPSBhd2FpdCBnZXRDcnlwdG9LZXkoc2VjcmV0KVxuICBjb25zdCBzaWduYXR1cmUgPSBhd2FpdCBjcnlwdG8uc3VidGxlLnNpZ24oYWxnb3JpdGhtLm5hbWUsIGtleSwgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHZhbHVlKSlcbiAgLy8gdGhlIHJldHVybmVkIGJhc2U2NCBlbmNvZGVkIHNpZ25hdHVyZSB3aWxsIGFsd2F5cyBiZSA0NCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGVuZCB3aXRoIG9uZSBvciB0d28gZXF1YWwgc2lnbnNcbiAgcmV0dXJuIGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZSguLi5uZXcgVWludDhBcnJheShzaWduYXR1cmUpKSlcbn1cblxuY29uc3QgdmVyaWZ5U2lnbmF0dXJlID0gYXN5bmMgKFxuICBiYXNlNjRTaWduYXR1cmU6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgc2VjcmV0OiBDcnlwdG9LZXlcbik6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNpZ25hdHVyZUJpblN0ciA9IGF0b2IoYmFzZTY0U2lnbmF0dXJlKVxuICAgIGNvbnN0IHNpZ25hdHVyZSA9IG5ldyBVaW50OEFycmF5KHNpZ25hdHVyZUJpblN0ci5sZW5ndGgpXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaWduYXR1cmVCaW5TdHIubGVuZ3RoOyBpKyspIHNpZ25hdHVyZVtpXSA9IHNpZ25hdHVyZUJpblN0ci5jaGFyQ29kZUF0KGkpXG4gICAgcmV0dXJuIGF3YWl0IGNyeXB0by5zdWJ0bGUudmVyaWZ5KGFsZ29yaXRobSwgc2VjcmV0LCBzaWduYXR1cmUsIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh2YWx1ZSkpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG4vLyBhbGwgYWxwaGFudW1lcmljIGNoYXJzIGFuZCBhbGwgb2YgXyEjJCUmJyouXmB8fistXG4vLyAoc2VlOiBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9odG1sL3JmYzYyNjUjc2VjdGlvbi00LjEuMSlcbmNvbnN0IHZhbGlkQ29va2llTmFtZVJlZ0V4ID0gL15bXFx3ISMkJSYnKi5eYHx+Ky1dKyQvXG5cbi8vIGFsbCBBU0NJSSBjaGFycyAzMi0xMjYgZXhjZXB0IDM0LCA1OSwgYW5kIDkyIChpLmUuIHNwYWNlIHRvIHRpbGRlIGJ1dCBub3QgZG91YmxlIHF1b3RlLCBzZW1pY29sb24sIG9yIGJhY2tzbGFzaClcbi8vIChzZWU6IGh0dHBzOi8vZGF0YXRyYWNrZXIuaWV0Zi5vcmcvZG9jL2h0bWwvcmZjNjI2NSNzZWN0aW9uLTQuMS4xKVxuLy9cbi8vIG5vdGU6IHRoZSBzcGVjIGFsc28gcHJvaGliaXRzIGNvbW1hIGFuZCBzcGFjZSwgYnV0IHdlIGFsbG93IGJvdGggc2luY2UgdGhleSBhcmUgdmVyeSBjb21tb24gaW4gdGhlIHJlYWwgd29ybGRcbi8vIChzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9nb2xhbmcvZ28vaXNzdWVzLzcyNDMpXG5jb25zdCB2YWxpZENvb2tpZVZhbHVlUmVnRXggPSAvXlsgISMtOjwtW1xcXS1+XSokL1xuXG5leHBvcnQgY29uc3QgcGFyc2UgPSAoY29va2llOiBzdHJpbmcsIG5hbWU/OiBzdHJpbmcpOiBDb29raWUgPT4ge1xuICBjb25zdCBwYWlycyA9IGNvb2tpZS50cmltKCkuc3BsaXQoJzsnKVxuICByZXR1cm4gcGFpcnMucmVkdWNlKChwYXJzZWRDb29raWUsIHBhaXJTdHIpID0+IHtcbiAgICBwYWlyU3RyID0gcGFpclN0ci50cmltKClcbiAgICBjb25zdCB2YWx1ZVN0YXJ0UG9zID0gcGFpclN0ci5pbmRleE9mKCc9JylcbiAgICBpZiAodmFsdWVTdGFydFBvcyA9PT0gLTEpIHJldHVybiBwYXJzZWRDb29raWVcblxuICAgIGNvbnN0IGNvb2tpZU5hbWUgPSBwYWlyU3RyLnN1YnN0cmluZygwLCB2YWx1ZVN0YXJ0UG9zKS50cmltKClcbiAgICBpZiAoKG5hbWUgJiYgbmFtZSAhPT0gY29va2llTmFtZSkgfHwgIXZhbGlkQ29va2llTmFtZVJlZ0V4LnRlc3QoY29va2llTmFtZSkpIHJldHVybiBwYXJzZWRDb29raWVcblxuICAgIGxldCBjb29raWVWYWx1ZSA9IHBhaXJTdHIuc3Vic3RyaW5nKHZhbHVlU3RhcnRQb3MgKyAxKS50cmltKClcbiAgICBpZiAoY29va2llVmFsdWUuc3RhcnRzV2l0aCgnXCInKSAmJiBjb29raWVWYWx1ZS5lbmRzV2l0aCgnXCInKSlcbiAgICAgIGNvb2tpZVZhbHVlID0gY29va2llVmFsdWUuc2xpY2UoMSwgLTEpXG4gICAgaWYgKHZhbGlkQ29va2llVmFsdWVSZWdFeC50ZXN0KGNvb2tpZVZhbHVlKSlcbiAgICAgIHBhcnNlZENvb2tpZVtjb29raWVOYW1lXSA9IGRlY29kZVVSSUNvbXBvbmVudF8oY29va2llVmFsdWUpXG5cbiAgICByZXR1cm4gcGFyc2VkQ29va2llXG4gIH0sIHt9IGFzIENvb2tpZSlcbn1cblxuZXhwb3J0IGNvbnN0IHBhcnNlU2lnbmVkID0gYXN5bmMgKFxuICBjb29raWU6IHN0cmluZyxcbiAgc2VjcmV0OiBzdHJpbmcgfCBCdWZmZXJTb3VyY2UsXG4gIG5hbWU/OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkQ29va2llPiA9PiB7XG4gIGNvbnN0IHBhcnNlZENvb2tpZTogU2lnbmVkQ29va2llID0ge31cbiAgY29uc3Qgc2VjcmV0S2V5ID0gYXdhaXQgZ2V0Q3J5cHRvS2V5KHNlY3JldClcblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwYXJzZShjb29raWUsIG5hbWUpKSkge1xuICAgIGNvbnN0IHNpZ25hdHVyZVN0YXJ0UG9zID0gdmFsdWUubGFzdEluZGV4T2YoJy4nKVxuICAgIGlmIChzaWduYXR1cmVTdGFydFBvcyA8IDEpIGNvbnRpbnVlXG5cbiAgICBjb25zdCBzaWduZWRWYWx1ZSA9IHZhbHVlLnN1YnN0cmluZygwLCBzaWduYXR1cmVTdGFydFBvcylcbiAgICBjb25zdCBzaWduYXR1cmUgPSB2YWx1ZS5zdWJzdHJpbmcoc2lnbmF0dXJlU3RhcnRQb3MgKyAxKVxuICAgIGlmIChzaWduYXR1cmUubGVuZ3RoICE9PSA0NCB8fCAhc2lnbmF0dXJlLmVuZHNXaXRoKCc9JykpIGNvbnRpbnVlXG5cbiAgICBjb25zdCBpc1ZlcmlmaWVkID0gYXdhaXQgdmVyaWZ5U2lnbmF0dXJlKHNpZ25hdHVyZSwgc2lnbmVkVmFsdWUsIHNlY3JldEtleSlcbiAgICBwYXJzZWRDb29raWVba2V5XSA9IGlzVmVyaWZpZWQgPyBzaWduZWRWYWx1ZSA6IGZhbHNlXG4gIH1cblxuICByZXR1cm4gcGFyc2VkQ29va2llXG59XG5cbmNvbnN0IF9zZXJpYWxpemUgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBvcHQ6IENvb2tpZU9wdGlvbnMgPSB7fSk6IHN0cmluZyA9PiB7XG4gIGxldCBjb29raWUgPSBgJHtuYW1lfT0ke3ZhbHVlfWBcblxuICBpZiAob3B0ICYmIHR5cGVvZiBvcHQubWF4QWdlID09PSAnbnVtYmVyJyAmJiBvcHQubWF4QWdlID49IDApIHtcbiAgICBjb29raWUgKz0gYDsgTWF4LUFnZT0ke01hdGguZmxvb3Iob3B0Lm1heEFnZSl9YFxuICB9XG5cbiAgaWYgKG9wdC5kb21haW4pIHtcbiAgICBjb29raWUgKz0gYDsgRG9tYWluPSR7b3B0LmRvbWFpbn1gXG4gIH1cblxuICBpZiAob3B0LnBhdGgpIHtcbiAgICBjb29raWUgKz0gYDsgUGF0aD0ke29wdC5wYXRofWBcbiAgfVxuXG4gIGlmIChvcHQuZXhwaXJlcykge1xuICAgIGNvb2tpZSArPSBgOyBFeHBpcmVzPSR7b3B0LmV4cGlyZXMudG9VVENTdHJpbmcoKX1gXG4gIH1cblxuICBpZiAob3B0Lmh0dHBPbmx5KSB7XG4gICAgY29va2llICs9ICc7IEh0dHBPbmx5J1xuICB9XG5cbiAgaWYgKG9wdC5zZWN1cmUpIHtcbiAgICBjb29raWUgKz0gJzsgU2VjdXJlJ1xuICB9XG5cbiAgaWYgKG9wdC5zYW1lU2l0ZSkge1xuICAgIGNvb2tpZSArPSBgOyBTYW1lU2l0ZT0ke29wdC5zYW1lU2l0ZX1gXG4gIH1cblxuICBpZiAob3B0LnBhcnRpdGlvbmVkKSB7XG4gICAgY29va2llICs9ICc7IFBhcnRpdGlvbmVkJ1xuICB9XG5cbiAgcmV0dXJuIGNvb2tpZVxufVxuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0OiBDb29raWVPcHRpb25zID0ge30pOiBzdHJpbmcgPT4ge1xuICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcbiAgcmV0dXJuIF9zZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbn1cblxuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZVNpZ25lZCA9IGFzeW5jIChcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICBzZWNyZXQ6IHN0cmluZyB8IEJ1ZmZlclNvdXJjZSxcbiAgb3B0OiBDb29raWVPcHRpb25zID0ge31cbik6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IG1ha2VTaWduYXR1cmUodmFsdWUsIHNlY3JldClcbiAgdmFsdWUgPSBgJHt2YWx1ZX0uJHtzaWduYXR1cmV9YFxuICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcbiAgcmV0dXJuIF9zZXJpYWxpemUobmFtZSwgdmFsdWUsIG9wdClcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLG1CQUFtQixRQUFRLFdBQVU7QUFnQjlDLE1BQU0sWUFBWTtJQUFFLE1BQU07SUFBUSxNQUFNO0FBQVU7QUFFbEQsTUFBTSxlQUFlLE9BQU8sU0FBc0Q7SUFDaEYsTUFBTSxZQUFZLE9BQU8sV0FBVyxXQUFXLElBQUksY0FBYyxNQUFNLENBQUMsVUFBVSxNQUFNO0lBQ3hGLE9BQU8sTUFBTSxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxXQUFX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