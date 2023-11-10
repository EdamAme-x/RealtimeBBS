export const METHOD_NAME_ALL = 'ALL';
export const METHOD_NAME_ALL_LOWERCASE = 'all';
export const METHODS = [
    'get',
    'post',
    'put',
    'delete',
    'options',
    'patch'
];
/*
The router returns the result of `match` in either format.

[[handler, paramIndexMap][], paramArray]
e.g.
[
  [
    [middlewareA, {}],                     // '*'
    [funcA,       {'id': 0}],              // '/user/:id/*'
    [funcB,       {'id': 0, 'action': 1}], // '/user/:id/:action'
  ],
  ['123', 'abc']
]

[[handler, params][]]
e.g.
[
  [
    [middlewareA, {}],                             // '*'
    [funcA,       {'id': '123'}],                  // '/user/:id/*'
    [funcB,       {'id': '123', 'action': 'abc'}], // '/user/:id/:action'
  ]
]
*/ export class UnsupportedPathError extends Error {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wLXJjLjIvcm91dGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBNRVRIT0RfTkFNRV9BTEwgPSAnQUxMJyBhcyBjb25zdFxuZXhwb3J0IGNvbnN0IE1FVEhPRF9OQU1FX0FMTF9MT1dFUkNBU0UgPSAnYWxsJyBhcyBjb25zdFxuZXhwb3J0IGNvbnN0IE1FVEhPRFMgPSBbJ2dldCcsICdwb3N0JywgJ3B1dCcsICdkZWxldGUnLCAnb3B0aW9ucycsICdwYXRjaCddIGFzIGNvbnN0XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm91dGVyPFQ+IHtcbiAgbmFtZTogc3RyaW5nXG4gIGFkZChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBoYW5kbGVyOiBUKTogdm9pZFxuICBtYXRjaChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUmVzdWx0PFQ+XG59XG5cbmV4cG9ydCB0eXBlIFBhcmFtSW5kZXhNYXAgPSBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+XG5leHBvcnQgdHlwZSBQYXJhbVN0YXNoID0gc3RyaW5nW11cbmV4cG9ydCB0eXBlIFBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IFtbVCwgUGFyYW1JbmRleE1hcF1bXSwgUGFyYW1TdGFzaF0gfCBbW1QsIFBhcmFtc11bXV1cbi8qXG5UaGUgcm91dGVyIHJldHVybnMgdGhlIHJlc3VsdCBvZiBgbWF0Y2hgIGluIGVpdGhlciBmb3JtYXQuXG5cbltbaGFuZGxlciwgcGFyYW1JbmRleE1hcF1bXSwgcGFyYW1BcnJheV1cbmUuZy5cbltcbiAgW1xuICAgIFttaWRkbGV3YXJlQSwge31dLCAgICAgICAgICAgICAgICAgICAgIC8vICcqJ1xuICAgIFtmdW5jQSwgICAgICAgeydpZCc6IDB9XSwgICAgICAgICAgICAgIC8vICcvdXNlci86aWQvKidcbiAgICBbZnVuY0IsICAgICAgIHsnaWQnOiAwLCAnYWN0aW9uJzogMX1dLCAvLyAnL3VzZXIvOmlkLzphY3Rpb24nXG4gIF0sXG4gIFsnMTIzJywgJ2FiYyddXG5dXG5cbltbaGFuZGxlciwgcGFyYW1zXVtdXVxuZS5nLlxuW1xuICBbXG4gICAgW21pZGRsZXdhcmVBLCB7fV0sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAnKidcbiAgICBbZnVuY0EsICAgICAgIHsnaWQnOiAnMTIzJ31dLCAgICAgICAgICAgICAgICAgIC8vICcvdXNlci86aWQvKidcbiAgICBbZnVuY0IsICAgICAgIHsnaWQnOiAnMTIzJywgJ2FjdGlvbic6ICdhYmMnfV0sIC8vICcvdXNlci86aWQvOmFjdGlvbidcbiAgXVxuXVxuKi9cblxuZXhwb3J0IGNsYXNzIFVuc3VwcG9ydGVkUGF0aEVycm9yIGV4dGVuZHMgRXJyb3Ige31cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sa0JBQWtCLE1BQWM7QUFDN0MsT0FBTyxNQUFNLDRCQUE0QixNQUFjO0FBQ3ZELE9BQU8sTUFBTSxVQUFVO0lBQUM7SUFBTztJQUFRO0lBQU87SUFBVTtJQUFXO0NBQVEsQ0FBUztBQVlwRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkEsR0FFQSxPQUFPLE1BQU0sNkJBQTZCO0FBQU8sQ0FBQyJ9