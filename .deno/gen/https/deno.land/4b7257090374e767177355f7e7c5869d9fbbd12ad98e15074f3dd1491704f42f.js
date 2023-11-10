import { HTTPException } from '../../http-exception.ts';
import { timingSafeEqual } from '../../utils/buffer.ts';
const TOKEN_STRINGS = '[A-Za-z0-9._~+/-]+=*';
const PREFIX = 'Bearer';
export const bearerAuth = (options)=>{
    if (!options.token) {
        throw new Error('bearer auth middleware requires options for "token"');
    }
    if (!options.realm) {
        options.realm = '';
    }
    if (!options.prefix) {
        options.prefix = PREFIX;
    }
    const realm = options.realm?.replace(/"/g, '\\"');
    return async (c, next)=>{
        const headerToken = c.req.header('Authorization');
        if (!headerToken) {
            // No Authorization header
            const res = new Response('Unauthorized', {
                status: 401,
                headers: {
                    'WWW-Authenticate': `${options.prefix} realm="` + realm + '"'
                }
            });
            throw new HTTPException(401, {
                res
            });
        } else {
            const regexp = new RegExp('^' + options.prefix + ' +(' + TOKEN_STRINGS + ') *$');
            const match = regexp.exec(headerToken);
            if (!match) {
                // Invalid Request
                const res = new Response('Bad Request', {
                    status: 400,
                    headers: {
                        'WWW-Authenticate': `${options.prefix} error="invalid_request"`
                    }
                });
                throw new HTTPException(400, {
                    res
                });
            } else {
                const equal = await timingSafeEqual(options.token, match[1], options.hashFunction);
                if (!equal) {
                    // Invalid Token
                    const res = new Response('Unauthorized', {
                        status: 401,
                        headers: {
                            'WWW-Authenticate': `${options.prefix} error="invalid_token"`
                        }
                    });
                    throw new HTTPException(401, {
                        res
                    });
                }
            }
        }
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvbWlkZGxld2FyZS9iZWFyZXItYXV0aC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIVFRQRXhjZXB0aW9uIH0gZnJvbSAnLi4vLi4vaHR0cC1leGNlcHRpb24udHMnXG5pbXBvcnQgdHlwZSB7IE1pZGRsZXdhcmVIYW5kbGVyIH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgeyB0aW1pbmdTYWZlRXF1YWwgfSBmcm9tICcuLi8uLi91dGlscy9idWZmZXIudHMnXG5cbmNvbnN0IFRPS0VOX1NUUklOR1MgPSAnW0EtWmEtejAtOS5ffisvLV0rPSonXG5jb25zdCBQUkVGSVggPSAnQmVhcmVyJ1xuXG5leHBvcnQgY29uc3QgYmVhcmVyQXV0aCA9IChvcHRpb25zOiB7XG4gIHRva2VuOiBzdHJpbmdcbiAgcmVhbG0/OiBzdHJpbmdcbiAgcHJlZml4Pzogc3RyaW5nXG4gIGhhc2hGdW5jdGlvbj86IEZ1bmN0aW9uXG59KTogTWlkZGxld2FyZUhhbmRsZXIgPT4ge1xuICBpZiAoIW9wdGlvbnMudG9rZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlYXJlciBhdXRoIG1pZGRsZXdhcmUgcmVxdWlyZXMgb3B0aW9ucyBmb3IgXCJ0b2tlblwiJylcbiAgfVxuICBpZiAoIW9wdGlvbnMucmVhbG0pIHtcbiAgICBvcHRpb25zLnJlYWxtID0gJydcbiAgfVxuICBpZiAoIW9wdGlvbnMucHJlZml4KSB7XG4gICAgb3B0aW9ucy5wcmVmaXggPSBQUkVGSVhcbiAgfVxuXG4gIGNvbnN0IHJlYWxtID0gb3B0aW9ucy5yZWFsbT8ucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG5cbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgaGVhZGVyVG9rZW4gPSBjLnJlcS5oZWFkZXIoJ0F1dGhvcml6YXRpb24nKVxuXG4gICAgaWYgKCFoZWFkZXJUb2tlbikge1xuICAgICAgLy8gTm8gQXV0aG9yaXphdGlvbiBoZWFkZXJcbiAgICAgIGNvbnN0IHJlcyA9IG5ldyBSZXNwb25zZSgnVW5hdXRob3JpemVkJywge1xuICAgICAgICBzdGF0dXM6IDQwMSxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdXV1ctQXV0aGVudGljYXRlJzogYCR7b3B0aW9ucy5wcmVmaXh9IHJlYWxtPVwiYCArIHJlYWxtICsgJ1wiJyxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDEsIHsgcmVzIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlZ2V4cCA9IG5ldyBSZWdFeHAoJ14nICsgb3B0aW9ucy5wcmVmaXggKyAnICsoJyArIFRPS0VOX1NUUklOR1MgKyAnKSAqJCcpXG4gICAgICBjb25zdCBtYXRjaCA9IHJlZ2V4cC5leGVjKGhlYWRlclRva2VuKVxuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAvLyBJbnZhbGlkIFJlcXVlc3RcbiAgICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdCYWQgUmVxdWVzdCcsIHtcbiAgICAgICAgICBzdGF0dXM6IDQwMCxcbiAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnV1dXLUF1dGhlbnRpY2F0ZSc6IGAke29wdGlvbnMucHJlZml4fSBlcnJvcj1cImludmFsaWRfcmVxdWVzdFwiYCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDAsIHsgcmVzIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcXVhbCA9IGF3YWl0IHRpbWluZ1NhZmVFcXVhbChvcHRpb25zLnRva2VuLCBtYXRjaFsxXSwgb3B0aW9ucy5oYXNoRnVuY3Rpb24pXG4gICAgICAgIGlmICghZXF1YWwpIHtcbiAgICAgICAgICAvLyBJbnZhbGlkIFRva2VuXG4gICAgICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICAgICAgICBzdGF0dXM6IDQwMSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiBgJHtvcHRpb25zLnByZWZpeH0gZXJyb3I9XCJpbnZhbGlkX3Rva2VuXCJgLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHRocm93IG5ldyBIVFRQRXhjZXB0aW9uKDQwMSwgeyByZXMgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBuZXh0KClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsYUFBYSxRQUFRLDBCQUF5QjtBQUV2RCxTQUFTLGVBQWUsUUFBUSx3QkFBdUI7QUFFdkQsTUFBTSxnQkFBZ0I7QUFDdEIsTUFBTSxTQUFTO0FBRWYsT0FBTyxNQUFNLGFBQWEsQ0FBQyxVQUtGO0lBQ3ZCLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRTtRQUNsQixNQUFNLElBQUksTUFBTSx1REFBc0Q7SUFDeEUsQ0FBQztJQUNELElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRTtRQUNsQixRQUFRLEtBQUssR0FBRztJQUNsQixDQUFDO0lBQ0QsSUFBSSxDQUFDLFFBQVEsTUFBTSxFQUFFO1FBQ25CLFFBQVEsTUFBTSxHQUFHO0lBQ25CLENBQUM7SUFFRCxNQUFNLFFBQVEsUUFBUSxLQUFLLEVBQUUsUUFBUSxNQUFNO0lBRTNDLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsTUFBTSxjQUFjLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsYUFBYTtZQUNoQiwwQkFBMEI7WUFDMUIsTUFBTSxNQUFNLElBQUksU0FBUyxnQkFBZ0I7Z0JBQ3ZDLFFBQVE7Z0JBQ1IsU0FBUztvQkFDUCxvQkFBb0IsQ0FBQyxFQUFFLFFBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVE7Z0JBQzVEO1lBQ0Y7WUFDQSxNQUFNLElBQUksY0FBYyxLQUFLO2dCQUFFO1lBQUksR0FBRTtRQUN2QyxPQUFPO1lBQ0wsTUFBTSxTQUFTLElBQUksT0FBTyxNQUFNLFFBQVEsTUFBTSxHQUFHLFFBQVEsZ0JBQWdCO1lBQ3pFLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTztnQkFDVixrQkFBa0I7Z0JBQ2xCLE1BQU0sTUFBTSxJQUFJLFNBQVMsZUFBZTtvQkFDdEMsUUFBUTtvQkFDUixTQUFTO3dCQUNQLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxNQUFNLENBQUMsd0JBQXdCLENBQUM7b0JBQ2pFO2dCQUNGO2dCQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7b0JBQUU7Z0JBQUksR0FBRTtZQUN2QyxPQUFPO2dCQUNMLE1BQU0sUUFBUSxNQUFNLGdCQUFnQixRQUFRLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsWUFBWTtnQkFDakYsSUFBSSxDQUFDLE9BQU87b0JBQ1YsZ0JBQWdCO29CQUNoQixNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjt3QkFDdkMsUUFBUTt3QkFDUixTQUFTOzRCQUNQLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxNQUFNLENBQUMsc0JBQXNCLENBQUM7d0JBQy9EO29CQUNGO29CQUNBLE1BQU0sSUFBSSxjQUFjLEtBQUs7d0JBQUU7b0JBQUksR0FBRTtnQkFDdkMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTTtJQUNSO0FBQ0YsRUFBQyJ9