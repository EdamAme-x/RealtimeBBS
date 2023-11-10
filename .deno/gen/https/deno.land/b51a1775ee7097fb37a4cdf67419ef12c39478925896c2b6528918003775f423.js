import { HTTPException } from '../../http-exception.ts';
import { Jwt } from '../../utils/jwt/index.ts';
import '../../context.ts';
export const jwt = (options)=>{
    if (!options) {
        throw new Error('JWT auth middleware requires options for "secret');
    }
    if (!crypto.subtle || !crypto.subtle.importKey) {
        throw new Error('`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.');
    }
    return async (ctx, next)=>{
        const credentials = ctx.req.headers.get('Authorization');
        let token;
        if (credentials) {
            const parts = credentials.split(/\s+/);
            if (parts.length !== 2) {
                const res = new Response('Unauthorized', {
                    status: 401,
                    headers: {
                        'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="invalid credentials structure"`
                    }
                });
                throw new HTTPException(401, {
                    res
                });
            } else {
                token = parts[1];
            }
        } else if (options.cookie) {
            token = ctx.req.cookie(options.cookie);
        }
        if (!token) {
            const res = new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_request",error_description="no authorization included in request"`
                }
            });
            throw new HTTPException(401, {
                res
            });
        }
        let payload;
        let msg = '';
        try {
            payload = await Jwt.verify(token, options.secret, options.alg);
        } catch (e) {
            msg = `${e}`;
        }
        if (!payload) {
            const res = new Response('Unauthorized', {
                status: 401,
                statusText: msg,
                headers: {
                    'WWW-Authenticate': `Bearer realm="${ctx.req.url}",error="invalid_token",error_description="token verification failure"`
                }
            });
            throw new HTTPException(401, {
                res
            });
        }
        ctx.set('jwtPayload', payload);
        await next();
    };
};
export const verify = Jwt.verify;
export const decode = Jwt.decode;
export const sign = Jwt.sign;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9qd3QvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSFRUUEV4Y2VwdGlvbiB9IGZyb20gJy4uLy4uL2h0dHAtZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgSnd0IH0gZnJvbSAnLi4vLi4vdXRpbHMvand0L2luZGV4LnRzJ1xuaW1wb3J0IHR5cGUgeyBBbGdvcml0aG1UeXBlcyB9IGZyb20gJy4uLy4uL3V0aWxzL2p3dC90eXBlcy50cydcbmltcG9ydCAnLi4vLi4vY29udGV4dC50cydcblxuZGVjbGFyZSBtb2R1bGUgJy4uLy4uL2NvbnRleHQudHMnIHtcbiAgaW50ZXJmYWNlIENvbnRleHRWYXJpYWJsZU1hcCB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBqd3RQYXlsb2FkOiBhbnlcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgand0ID0gKG9wdGlvbnM6IHtcbiAgc2VjcmV0OiBzdHJpbmdcbiAgY29va2llPzogc3RyaW5nXG4gIGFsZz86IHN0cmluZ1xufSk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdKV1QgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIG9wdGlvbnMgZm9yIFwic2VjcmV0JylcbiAgfVxuXG4gIGlmICghY3J5cHRvLnN1YnRsZSB8fCAhY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BjcnlwdG8uc3VidGxlLmltcG9ydEtleWAgaXMgdW5kZWZpbmVkLiBKV1QgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIGl0LicpXG4gIH1cblxuICByZXR1cm4gYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzID0gY3R4LnJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpXG4gICAgbGV0IHRva2VuXG4gICAgaWYgKGNyZWRlbnRpYWxzKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGNyZWRlbnRpYWxzLnNwbGl0KC9cXHMrLylcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICAgICAgc3RhdHVzOiA0MDEsXG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgQmVhcmVyIHJlYWxtPVwiJHtjdHgucmVxLnVybH1cIixlcnJvcj1cImludmFsaWRfcmVxdWVzdFwiLGVycm9yX2Rlc2NyaXB0aW9uPVwiaW52YWxpZCBjcmVkZW50aWFscyBzdHJ1Y3R1cmVcImAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICAgdGhyb3cgbmV3IEhUVFBFeGNlcHRpb24oNDAxLCB7IHJlcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdG9rZW4gPSBwYXJ0c1sxXVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb29raWUpIHtcbiAgICAgIHRva2VuID0gY3R4LnJlcS5jb29raWUob3B0aW9ucy5jb29raWUpXG4gICAgfVxuXG4gICAgaWYgKCF0b2tlbikge1xuICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICAgIHN0YXR1czogNDAxLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgQmVhcmVyIHJlYWxtPVwiJHtjdHgucmVxLnVybH1cIixlcnJvcj1cImludmFsaWRfcmVxdWVzdFwiLGVycm9yX2Rlc2NyaXB0aW9uPVwibm8gYXV0aG9yaXphdGlvbiBpbmNsdWRlZCBpbiByZXF1ZXN0XCJgLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICB9XG5cbiAgICBsZXQgcGF5bG9hZFxuICAgIGxldCBtc2cgPSAnJ1xuICAgIHRyeSB7XG4gICAgICBwYXlsb2FkID0gYXdhaXQgSnd0LnZlcmlmeSh0b2tlbiwgb3B0aW9ucy5zZWNyZXQsIG9wdGlvbnMuYWxnIGFzIEFsZ29yaXRobVR5cGVzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG1zZyA9IGAke2V9YFxuICAgIH1cbiAgICBpZiAoIXBheWxvYWQpIHtcbiAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnVW5hdXRob3JpemVkJywge1xuICAgICAgICBzdGF0dXM6IDQwMSxcbiAgICAgICAgc3RhdHVzVGV4dDogbXNnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgQmVhcmVyIHJlYWxtPVwiJHtjdHgucmVxLnVybH1cIixlcnJvcj1cImludmFsaWRfdG9rZW5cIixlcnJvcl9kZXNjcmlwdGlvbj1cInRva2VuIHZlcmlmaWNhdGlvbiBmYWlsdXJlXCJgLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICB9XG5cbiAgICBjdHguc2V0KCdqd3RQYXlsb2FkJywgcGF5bG9hZClcblxuICAgIGF3YWl0IG5leHQoKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCB2ZXJpZnkgPSBKd3QudmVyaWZ5XG5leHBvcnQgY29uc3QgZGVjb2RlID0gSnd0LmRlY29kZVxuZXhwb3J0IGNvbnN0IHNpZ24gPSBKd3Quc2lnblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsYUFBYSxRQUFRLDBCQUF5QjtBQUV2RCxTQUFTLEdBQUcsUUFBUSwyQkFBMEI7QUFFOUMsT0FBTyxtQkFBa0I7QUFTekIsT0FBTyxNQUFNLE1BQU0sQ0FBQyxVQUlLO0lBQ3ZCLElBQUksQ0FBQyxTQUFTO1FBQ1osTUFBTSxJQUFJLE1BQU0sb0RBQW1EO0lBQ3JFLENBQUM7SUFFRCxJQUFJLENBQUMsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDOUMsTUFBTSxJQUFJLE1BQU0sNEVBQTJFO0lBQzdGLENBQUM7SUFFRCxPQUFPLE9BQU8sS0FBSyxPQUFTO1FBQzFCLE1BQU0sY0FBYyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3hDLElBQUk7UUFDSixJQUFJLGFBQWE7WUFDZixNQUFNLFFBQVEsWUFBWSxLQUFLLENBQUM7WUFDaEMsSUFBSSxNQUFNLE1BQU0sS0FBSyxHQUFHO2dCQUN0QixNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjtvQkFDdkMsUUFBUTtvQkFDUixTQUFTO3dCQUNQLG9CQUFvQixDQUFDLGNBQWMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsMkVBQTJFLENBQUM7b0JBQy9IO2dCQUNGO2dCQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7b0JBQUU7Z0JBQUksR0FBRTtZQUN2QyxPQUFPO2dCQUNMLFFBQVEsS0FBSyxDQUFDLEVBQUU7WUFDbEIsQ0FBQztRQUNILE9BQU8sSUFBSSxRQUFRLE1BQU0sRUFBRTtZQUN6QixRQUFRLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLE1BQU07UUFDdkMsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPO1lBQ1YsTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7Z0JBQ3ZDLFFBQVE7Z0JBQ1IsU0FBUztvQkFDUCxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLGtGQUFrRixDQUFDO2dCQUN0STtZQUNGO1lBQ0EsTUFBTSxJQUFJLGNBQWMsS0FBSztnQkFBRTtZQUFJLEdBQUU7UUFDdkMsQ0FBQztRQUVELElBQUk7UUFDSixJQUFJLE1BQU07UUFDVixJQUFJO1lBQ0YsVUFBVSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sUUFBUSxNQUFNLEVBQUUsUUFBUSxHQUFHO1FBQy9ELEVBQUUsT0FBTyxHQUFHO1lBQ1YsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2Q7UUFDQSxJQUFJLENBQUMsU0FBUztZQUNaLE1BQU0sTUFBTSxJQUFJLFNBQVMsZ0JBQWdCO2dCQUN2QyxRQUFRO2dCQUNSLFlBQVk7Z0JBQ1osU0FBUztvQkFDUCxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLHNFQUFzRSxDQUFDO2dCQUMxSDtZQUNGO1lBQ0EsTUFBTSxJQUFJLGNBQWMsS0FBSztnQkFBRTtZQUFJLEdBQUU7UUFDdkMsQ0FBQztRQUVELElBQUksR0FBRyxDQUFDLGNBQWM7UUFFdEIsTUFBTTtJQUNSO0FBQ0YsRUFBQztBQUVELE9BQU8sTUFBTSxTQUFTLElBQUksTUFBTSxDQUFBO0FBQ2hDLE9BQU8sTUFBTSxTQUFTLElBQUksTUFBTSxDQUFBO0FBQ2hDLE9BQU8sTUFBTSxPQUFPLElBQUksSUFBSSxDQUFBIn0=