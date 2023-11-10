import { encodeBase64Url, decodeBase64Url } from '../../utils/encode.ts';
import { JwtTokenIssuedAt } from './types.ts';
import { JwtTokenInvalid, JwtTokenNotBefore, JwtTokenExpired, JwtTokenSignatureMismatched, JwtAlgorithmNotImplemented } from './types.ts';
var CryptoKeyFormat;
(function(CryptoKeyFormat) {
    CryptoKeyFormat["RAW"] = 'raw';
    CryptoKeyFormat["PKCS8"] = 'pkcs8';
    CryptoKeyFormat["SPKI"] = 'spki';
    CryptoKeyFormat["JWK"] = 'jwk';
})(CryptoKeyFormat || (CryptoKeyFormat = {}));
var CryptoKeyUsage;
(function(CryptoKeyUsage) {
    CryptoKeyUsage["Ecrypt"] = 'encrypt';
    CryptoKeyUsage["Decrypt"] = 'decrypt';
    CryptoKeyUsage["Sign"] = 'sign';
    CryptoKeyUsage["Verify"] = 'verify';
    CryptoKeyUsage["Deriverkey"] = 'deriveKey';
    CryptoKeyUsage["DeriveBits"] = 'deriveBits';
    CryptoKeyUsage["WrapKey"] = 'wrapKey';
    CryptoKeyUsage["UnwrapKey"] = 'unwrapKey';
})(CryptoKeyUsage || (CryptoKeyUsage = {}));
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();
const encodeJwtPart = (part)=>encodeBase64Url(utf8Encoder.encode(JSON.stringify(part))).replace(/=/g, '');
const encodeSignaturePart = (buf)=>encodeBase64Url(buf).replace(/=/g, '');
const decodeJwtPart = (part)=>JSON.parse(utf8Decoder.decode(decodeBase64Url(part)));
const param = (name)=>{
    switch(name.toUpperCase()){
        case 'HS256':
            return {
                name: 'HMAC',
                hash: {
                    name: 'SHA-256'
                }
            };
        case 'HS384':
            return {
                name: 'HMAC',
                hash: {
                    name: 'SHA-384'
                }
            };
        case 'HS512':
            return {
                name: 'HMAC',
                hash: {
                    name: 'SHA-512'
                }
            };
        default:
            throw new JwtAlgorithmNotImplemented(name);
    }
};
const signing = async (data, secret, alg = 'HS256')=>{
    if (!crypto.subtle || !crypto.subtle.importKey) {
        throw new Error('`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.');
    }
    const utf8Encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(CryptoKeyFormat.RAW, utf8Encoder.encode(secret), param(alg), false, [
        CryptoKeyUsage.Sign
    ]);
    return await crypto.subtle.sign(param(alg), cryptoKey, utf8Encoder.encode(data));
};
export const sign = async (payload, secret, alg = 'HS256')=>{
    const encodedPayload = encodeJwtPart(payload);
    const encodedHeader = encodeJwtPart({
        alg,
        typ: 'JWT'
    });
    const partialToken = `${encodedHeader}.${encodedPayload}`;
    const signaturePart = await signing(partialToken, secret, alg);
    const signature = encodeSignaturePart(signaturePart);
    return `${partialToken}.${signature}`;
};
export const verify = async (token, secret, alg = 'HS256')=>{
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new JwtTokenInvalid(token);
    }
    const { payload  } = decode(token);
    const now = Math.floor(Date.now() / 1000);
    if (payload.nbf && payload.nbf > now) {
        throw new JwtTokenNotBefore(token);
    }
    if (payload.exp && payload.exp <= now) {
        throw new JwtTokenExpired(token);
    }
    if (payload.iat && now < payload.iat) {
        throw new JwtTokenIssuedAt(now, payload.iat);
    }
    const signaturePart = tokenParts.slice(0, 2).join('.');
    const signature = await signing(signaturePart, secret, alg);
    const encodedSignature = encodeSignaturePart(signature);
    if (encodedSignature !== tokenParts[2]) {
        throw new JwtTokenSignatureMismatched(token);
    }
    return payload;
};
// eslint-disable-next-line
export const decode = (token)=>{
    try {
        const [h, p] = token.split('.');
        const header = decodeJwtPart(h);
        const payload = decodeJwtPart(p);
        return {
            header,
            payload
        };
    } catch (e) {
        throw new JwtTokenInvalid(token);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvand0L2p3dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBlbmNvZGVCYXNlNjRVcmwsIGRlY29kZUJhc2U2NFVybCB9IGZyb20gJy4uLy4uL3V0aWxzL2VuY29kZS50cydcbmltcG9ydCB0eXBlIHsgQWxnb3JpdGhtVHlwZXMgfSBmcm9tICcuL3R5cGVzLnRzJ1xuaW1wb3J0IHsgSnd0VG9rZW5Jc3N1ZWRBdCB9IGZyb20gJy4vdHlwZXMudHMnXG5pbXBvcnQge1xuICBKd3RUb2tlbkludmFsaWQsXG4gIEp3dFRva2VuTm90QmVmb3JlLFxuICBKd3RUb2tlbkV4cGlyZWQsXG4gIEp3dFRva2VuU2lnbmF0dXJlTWlzbWF0Y2hlZCxcbiAgSnd0QWxnb3JpdGhtTm90SW1wbGVtZW50ZWQsXG59IGZyb20gJy4vdHlwZXMudHMnXG5cbmludGVyZmFjZSBBbGdvcml0aG1QYXJhbXMge1xuICBuYW1lOiBzdHJpbmdcbiAgbmFtZWRDdXJ2ZT86IHN0cmluZ1xuICBoYXNoPzoge1xuICAgIG5hbWU6IHN0cmluZ1xuICB9XG59XG5cbmVudW0gQ3J5cHRvS2V5Rm9ybWF0IHtcbiAgUkFXID0gJ3JhdycsXG4gIFBLQ1M4ID0gJ3BrY3M4JyxcbiAgU1BLSSA9ICdzcGtpJyxcbiAgSldLID0gJ2p3aycsXG59XG5cbmVudW0gQ3J5cHRvS2V5VXNhZ2Uge1xuICBFY3J5cHQgPSAnZW5jcnlwdCcsXG4gIERlY3J5cHQgPSAnZGVjcnlwdCcsXG4gIFNpZ24gPSAnc2lnbicsXG4gIFZlcmlmeSA9ICd2ZXJpZnknLFxuICBEZXJpdmVya2V5ID0gJ2Rlcml2ZUtleScsXG4gIERlcml2ZUJpdHMgPSAnZGVyaXZlQml0cycsXG4gIFdyYXBLZXkgPSAnd3JhcEtleScsXG4gIFVud3JhcEtleSA9ICd1bndyYXBLZXknLFxufVxuXG50eXBlIEFsZ29yaXRobVR5cGVOYW1lID0ga2V5b2YgdHlwZW9mIEFsZ29yaXRobVR5cGVzXG5cbmNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKClcblxuY29uc3QgZW5jb2RlSnd0UGFydCA9IChwYXJ0OiB1bmtub3duKTogc3RyaW5nID0+XG4gIGVuY29kZUJhc2U2NFVybCh1dGY4RW5jb2Rlci5lbmNvZGUoSlNPTi5zdHJpbmdpZnkocGFydCkpKS5yZXBsYWNlKC89L2csICcnKVxuY29uc3QgZW5jb2RlU2lnbmF0dXJlUGFydCA9IChidWY6IEFycmF5QnVmZmVyTGlrZSk6IHN0cmluZyA9PiBlbmNvZGVCYXNlNjRVcmwoYnVmKS5yZXBsYWNlKC89L2csICcnKVxuXG5jb25zdCBkZWNvZGVKd3RQYXJ0ID0gKHBhcnQ6IHN0cmluZyk6IHVua25vd24gPT5cbiAgSlNPTi5wYXJzZSh1dGY4RGVjb2Rlci5kZWNvZGUoZGVjb2RlQmFzZTY0VXJsKHBhcnQpKSlcblxuY29uc3QgcGFyYW0gPSAobmFtZTogQWxnb3JpdGhtVHlwZU5hbWUpOiBBbGdvcml0aG1QYXJhbXMgPT4ge1xuICBzd2l0Y2ggKG5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgIGNhc2UgJ0hTMjU2JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICdITUFDJyxcbiAgICAgICAgaGFzaDoge1xuICAgICAgICAgIG5hbWU6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICBjYXNlICdIUzM4NCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiAnSE1BQycsXG4gICAgICAgIGhhc2g6IHtcbiAgICAgICAgICBuYW1lOiAnU0hBLTM4NCcsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgY2FzZSAnSFM1MTInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogJ0hNQUMnLFxuICAgICAgICBoYXNoOiB7XG4gICAgICAgICAgbmFtZTogJ1NIQS01MTInLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgSnd0QWxnb3JpdGhtTm90SW1wbGVtZW50ZWQobmFtZSlcbiAgfVxufVxuXG5jb25zdCBzaWduaW5nID0gYXN5bmMgKFxuICBkYXRhOiBzdHJpbmcsXG4gIHNlY3JldDogc3RyaW5nLFxuICBhbGc6IEFsZ29yaXRobVR5cGVOYW1lID0gJ0hTMjU2J1xuKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj4gPT4ge1xuICBpZiAoIWNyeXB0by5zdWJ0bGUgfHwgIWNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXlgIGlzIHVuZGVmaW5lZC4gSldUIGF1dGggbWlkZGxld2FyZSByZXF1aXJlcyBpdC4nKVxuICB9XG5cbiAgY29uc3QgdXRmOEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKVxuICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICBDcnlwdG9LZXlGb3JtYXQuUkFXLFxuICAgIHV0ZjhFbmNvZGVyLmVuY29kZShzZWNyZXQpLFxuICAgIHBhcmFtKGFsZyksXG4gICAgZmFsc2UsXG4gICAgW0NyeXB0b0tleVVzYWdlLlNpZ25dXG4gIClcbiAgcmV0dXJuIGF3YWl0IGNyeXB0by5zdWJ0bGUuc2lnbihwYXJhbShhbGcpLCBjcnlwdG9LZXksIHV0ZjhFbmNvZGVyLmVuY29kZShkYXRhKSlcbn1cblxuZXhwb3J0IGNvbnN0IHNpZ24gPSBhc3luYyAoXG4gIHBheWxvYWQ6IHVua25vd24sXG4gIHNlY3JldDogc3RyaW5nLFxuICBhbGc6IEFsZ29yaXRobVR5cGVOYW1lID0gJ0hTMjU2J1xuKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgZW5jb2RlZFBheWxvYWQgPSBlbmNvZGVKd3RQYXJ0KHBheWxvYWQpXG4gIGNvbnN0IGVuY29kZWRIZWFkZXIgPSBlbmNvZGVKd3RQYXJ0KHsgYWxnLCB0eXA6ICdKV1QnIH0pXG5cbiAgY29uc3QgcGFydGlhbFRva2VuID0gYCR7ZW5jb2RlZEhlYWRlcn0uJHtlbmNvZGVkUGF5bG9hZH1gXG5cbiAgY29uc3Qgc2lnbmF0dXJlUGFydCA9IGF3YWl0IHNpZ25pbmcocGFydGlhbFRva2VuLCBzZWNyZXQsIGFsZylcbiAgY29uc3Qgc2lnbmF0dXJlID0gZW5jb2RlU2lnbmF0dXJlUGFydChzaWduYXR1cmVQYXJ0KVxuXG4gIHJldHVybiBgJHtwYXJ0aWFsVG9rZW59LiR7c2lnbmF0dXJlfWBcbn1cblxuZXhwb3J0IGNvbnN0IHZlcmlmeSA9IGFzeW5jIChcbiAgdG9rZW46IHN0cmluZyxcbiAgc2VjcmV0OiBzdHJpbmcsXG4gIGFsZzogQWxnb3JpdGhtVHlwZU5hbWUgPSAnSFMyNTYnXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4pOiBQcm9taXNlPGFueT4gPT4ge1xuICBjb25zdCB0b2tlblBhcnRzID0gdG9rZW4uc3BsaXQoJy4nKVxuICBpZiAodG9rZW5QYXJ0cy5sZW5ndGggIT09IDMpIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5JbnZhbGlkKHRva2VuKVxuICB9XG5cbiAgY29uc3QgeyBwYXlsb2FkIH0gPSBkZWNvZGUodG9rZW4pXG4gIGNvbnN0IG5vdyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApXG4gIGlmIChwYXlsb2FkLm5iZiAmJiBwYXlsb2FkLm5iZiA+IG5vdykge1xuICAgIHRocm93IG5ldyBKd3RUb2tlbk5vdEJlZm9yZSh0b2tlbilcbiAgfVxuICBpZiAocGF5bG9hZC5leHAgJiYgcGF5bG9hZC5leHAgPD0gbm93KSB7XG4gICAgdGhyb3cgbmV3IEp3dFRva2VuRXhwaXJlZCh0b2tlbilcbiAgfVxuICBpZiAocGF5bG9hZC5pYXQgJiYgbm93IDwgcGF5bG9hZC5pYXQpIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5Jc3N1ZWRBdChub3csIHBheWxvYWQuaWF0KVxuICB9XG5cbiAgY29uc3Qgc2lnbmF0dXJlUGFydCA9IHRva2VuUGFydHMuc2xpY2UoMCwgMikuam9pbignLicpXG4gIGNvbnN0IHNpZ25hdHVyZSA9IGF3YWl0IHNpZ25pbmcoc2lnbmF0dXJlUGFydCwgc2VjcmV0LCBhbGcpXG4gIGNvbnN0IGVuY29kZWRTaWduYXR1cmUgPSBlbmNvZGVTaWduYXR1cmVQYXJ0KHNpZ25hdHVyZSlcbiAgaWYgKGVuY29kZWRTaWduYXR1cmUgIT09IHRva2VuUGFydHNbMl0pIHtcbiAgICB0aHJvdyBuZXcgSnd0VG9rZW5TaWduYXR1cmVNaXNtYXRjaGVkKHRva2VuKVxuICB9XG5cbiAgcmV0dXJuIHBheWxvYWRcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5leHBvcnQgY29uc3QgZGVjb2RlID0gKHRva2VuOiBzdHJpbmcpOiB7IGhlYWRlcjogYW55OyBwYXlsb2FkOiBhbnkgfSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgW2gsIHBdID0gdG9rZW4uc3BsaXQoJy4nKVxuICAgIGNvbnN0IGhlYWRlciA9IGRlY29kZUp3dFBhcnQoaClcbiAgICBjb25zdCBwYXlsb2FkID0gZGVjb2RlSnd0UGFydChwKVxuICAgIHJldHVybiB7XG4gICAgICBoZWFkZXIsXG4gICAgICBwYXlsb2FkLFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBKd3RUb2tlbkludmFsaWQodG9rZW4pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGVBQWUsRUFBRSxlQUFlLFFBQVEsd0JBQXVCO0FBRXhFLFNBQVMsZ0JBQWdCLFFBQVEsYUFBWTtBQUM3QyxTQUNFLGVBQWUsRUFDZixpQkFBaUIsRUFDakIsZUFBZSxFQUNmLDJCQUEyQixFQUMzQiwwQkFBMEIsUUFDckIsYUFBWTtJQVVuQjtVQUFLLGVBQWU7SUFBZixnQkFDSCxTQUFNO0lBREgsZ0JBRUgsV0FBUTtJQUZMLGdCQUdILFVBQU87SUFISixnQkFJSCxTQUFN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