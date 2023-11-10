export class StreamingApi {
    writer;
    encoder;
    writable;
    constructor(writable){
        this.writable = writable;
        this.writer = writable.getWriter();
        this.encoder = new TextEncoder();
    }
    async write(input) {
        try {
            if (typeof input === 'string') {
                input = this.encoder.encode(input);
            }
            await this.writer.write(input);
        } catch (e) {
        // Do nothing. If you want to handle errors, create a stream by yourself.
        }
        return this;
    }
    async writeln(input) {
        await this.write(input + '\n');
        return this;
    }
    sleep(ms) {
        return new Promise((res)=>setTimeout(res, ms));
    }
    async close() {
        try {
            await this.writer.close();
        } catch (e) {
        // Do nothing. If you want to handle errors, create a stream by yourself.
        }
    }
    async pipe(body) {
        this.writer.releaseLock();
        await body.pipeTo(this.writable, {
            preventClose: true
        });
        this.writer = this.writable.getWriter();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvdXRpbHMvc3RyZWFtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBTdHJlYW1pbmdBcGkge1xuICBwcml2YXRlIHdyaXRlcjogV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyPFVpbnQ4QXJyYXk+XG4gIHByaXZhdGUgZW5jb2RlcjogVGV4dEVuY29kZXJcbiAgcHJpdmF0ZSB3cml0YWJsZTogV3JpdGFibGVTdHJlYW1cblxuICBjb25zdHJ1Y3Rvcih3cml0YWJsZTogV3JpdGFibGVTdHJlYW0pIHtcbiAgICB0aGlzLndyaXRhYmxlID0gd3JpdGFibGVcbiAgICB0aGlzLndyaXRlciA9IHdyaXRhYmxlLmdldFdyaXRlcigpXG4gICAgdGhpcy5lbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKClcbiAgfVxuXG4gIGFzeW5jIHdyaXRlKGlucHV0OiBVaW50OEFycmF5IHwgc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlucHV0ID0gdGhpcy5lbmNvZGVyLmVuY29kZShpbnB1dClcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMud3JpdGVyLndyaXRlKGlucHV0KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIERvIG5vdGhpbmcuIElmIHlvdSB3YW50IHRvIGhhbmRsZSBlcnJvcnMsIGNyZWF0ZSBhIHN0cmVhbSBieSB5b3Vyc2VsZi5cbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFzeW5jIHdyaXRlbG4oaW5wdXQ6IHN0cmluZykge1xuICAgIGF3YWl0IHRoaXMud3JpdGUoaW5wdXQgKyAnXFxuJylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2xlZXAobXM6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzKSA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKVxuICB9XG5cbiAgYXN5bmMgY2xvc2UoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMud3JpdGVyLmNsb3NlKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBEbyBub3RoaW5nLiBJZiB5b3Ugd2FudCB0byBoYW5kbGUgZXJyb3JzLCBjcmVhdGUgYSBzdHJlYW0gYnkgeW91cnNlbGYuXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcGlwZShib2R5OiBSZWFkYWJsZVN0cmVhbSkge1xuICAgIHRoaXMud3JpdGVyLnJlbGVhc2VMb2NrKClcbiAgICBhd2FpdCBib2R5LnBpcGVUbyh0aGlzLndyaXRhYmxlLCB7IHByZXZlbnRDbG9zZTogdHJ1ZSB9KVxuICAgIHRoaXMud3JpdGVyID0gdGhpcy53cml0YWJsZS5nZXRXcml0ZXIoKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNO0lBQ0gsT0FBK0M7SUFDL0MsUUFBb0I7SUFDcEIsU0FBd0I7SUFFaEMsWUFBWSxRQUF3QixDQUFFO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUc7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLFNBQVM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJO0lBQ3JCO0lBRUEsTUFBTSxNQUFNLEtBQTBCLEVBQUU7UUFDdEMsSUFBSTtZQUNGLElBQUksT0FBTyxVQUFVLFVBQVU7Z0JBQzdCLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDOUIsQ0FBQztZQUNELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDMUIsRUFBRSxPQUFPLEdBQUc7UUFDVix5RUFBeUU7UUFDM0U7UUFDQSxPQUFPLElBQUk7SUFDYjtJQUVBLE1BQU0sUUFBUSxLQUFhLEVBQUU7UUFDM0IsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7UUFDekIsT0FBTyxJQUFJO0lBQ2I7SUFFQSxNQUFNLEVBQVUsRUFBRTtRQUNoQixPQUFPLElBQUksUUFBUSxDQUFDLE1BQVEsV0FBVyxLQUFLO0lBQzlDO0lBRUEsTUFBTSxRQUFRO1FBQ1osSUFBSTtZQUNGLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO1FBQ3pCLEVBQUUsT0FBTyxHQUFHO1FBQ1YseUVBQXlFO1FBQzNFO0lBQ0Y7SUFFQSxNQUFNLEtBQUssSUFBb0IsRUFBRTtRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVc7UUFDdkIsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQUUsY0FBYyxJQUFJO1FBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVM7SUFDdkM7QUFDRixDQUFDIn0=