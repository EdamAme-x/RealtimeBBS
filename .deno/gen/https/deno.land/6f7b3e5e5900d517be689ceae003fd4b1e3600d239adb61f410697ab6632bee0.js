export const getFilePath = (options)=>{
    let filename = options.filename;
    if (/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(filename)) return;
    let root = options.root || '';
    const defaultDocument = options.defaultDocument || 'index.html';
    if (filename.endsWith('/')) {
        // /top/ => /top/index.html
        filename = filename.concat(defaultDocument);
    } else if (!filename.match(/\.[a-zA-Z0-9]+$/)) {
        // /top => /top/index.html
        filename = filename.concat('/' + defaultDocument);
    }
    // /foo.html => foo.html
    filename = filename.replace(/^\.?[\/\\]/, '');
    // foo\bar.txt => foo/bar.txt
    filename = filename.replace(/\\/, '/');
    // assets/ => assets
    root = root.replace(/\/$/, '');
    // ./assets/foo.html => assets/foo.html
    let path = root ? root + '/' + filename : filename;
    path = path.replace(/^\.?\//, '');
    return path;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvZmlsZXBhdGgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidHlwZSBGaWxlUGF0aE9wdGlvbnMgPSB7XG4gIGZpbGVuYW1lOiBzdHJpbmdcbiAgcm9vdD86IHN0cmluZ1xuICBkZWZhdWx0RG9jdW1lbnQ/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZpbGVQYXRoID0gKG9wdGlvbnM6IEZpbGVQYXRoT3B0aW9ucyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGxldCBmaWxlbmFtZSA9IG9wdGlvbnMuZmlsZW5hbWVcbiAgaWYgKC8oPzpefFtcXC9cXFxcXSlcXC5cXC4oPzokfFtcXC9cXFxcXSkvLnRlc3QoZmlsZW5hbWUpKSByZXR1cm5cblxuICBsZXQgcm9vdCA9IG9wdGlvbnMucm9vdCB8fCAnJ1xuICBjb25zdCBkZWZhdWx0RG9jdW1lbnQgPSBvcHRpb25zLmRlZmF1bHREb2N1bWVudCB8fCAnaW5kZXguaHRtbCdcblxuICBpZiAoZmlsZW5hbWUuZW5kc1dpdGgoJy8nKSkge1xuICAgIC8vIC90b3AvID0+IC90b3AvaW5kZXguaHRtbFxuICAgIGZpbGVuYW1lID0gZmlsZW5hbWUuY29uY2F0KGRlZmF1bHREb2N1bWVudClcbiAgfSBlbHNlIGlmICghZmlsZW5hbWUubWF0Y2goL1xcLlthLXpBLVowLTldKyQvKSkge1xuICAgIC8vIC90b3AgPT4gL3RvcC9pbmRleC5odG1sXG4gICAgZmlsZW5hbWUgPSBmaWxlbmFtZS5jb25jYXQoJy8nICsgZGVmYXVsdERvY3VtZW50KVxuICB9XG5cbiAgLy8gL2Zvby5odG1sID0+IGZvby5odG1sXG4gIGZpbGVuYW1lID0gZmlsZW5hbWUucmVwbGFjZSgvXlxcLj9bXFwvXFxcXF0vLCAnJylcblxuICAvLyBmb29cXGJhci50eHQgPT4gZm9vL2Jhci50eHRcbiAgZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKC9cXFxcLywgJy8nKVxuXG4gIC8vIGFzc2V0cy8gPT4gYXNzZXRzXG4gIHJvb3QgPSByb290LnJlcGxhY2UoL1xcLyQvLCAnJylcblxuICAvLyAuL2Fzc2V0cy9mb28uaHRtbCA9PiBhc3NldHMvZm9vLmh0bWxcbiAgbGV0IHBhdGggPSByb290ID8gcm9vdCArICcvJyArIGZpbGVuYW1lIDogZmlsZW5hbWVcbiAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcLj9cXC8vLCAnJylcblxuICByZXR1cm4gcGF0aFxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sTUFBTSxjQUFjLENBQUMsVUFBaUQ7SUFDM0UsSUFBSSxXQUFXLFFBQVEsUUFBUTtJQUMvQixJQUFJLCtCQUErQixJQUFJLENBQUMsV0FBVztJQUVuRCxJQUFJLE9BQU8sUUFBUSxJQUFJLElBQUk7SUFDM0IsTUFBTSxrQkFBa0IsUUFBUSxlQUFlLElBQUk7SUFFbkQsSUFBSSxTQUFTLFFBQVEsQ0FBQyxNQUFNO1FBQzFCLDJCQUEyQjtRQUMzQixXQUFXLFNBQVMsTUFBTSxDQUFDO0lBQzdCLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLG9CQUFvQjtRQUM3QywwQkFBMEI7UUFDMUIsV0FBVyxTQUFTLE1BQU0sQ0FBQyxNQUFNO0lBQ25DLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsV0FBVyxTQUFTLE9BQU8sQ0FBQyxjQUFjO0lBRTFDLDZCQUE2QjtJQUM3QixXQUFXLFNBQVMsT0FBTyxDQUFDLE1BQU07SUFFbEMsb0JBQW9CO0lBQ3BCLE9BQU8sS0FBSyxPQUFPLENBQUMsT0FBTztJQUUzQix1Q0FBdUM7SUFDdkMsSUFBSSxPQUFPLE9BQU8sT0FBTyxNQUFNLFdBQVcsUUFBUTtJQUNsRCxPQUFPLEtBQUssT0FBTyxDQUFDLFVBQVU7SUFFOUIsT0FBTztBQUNULEVBQUMifQ==