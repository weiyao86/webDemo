/*
define static const
*/

define('consts', [], function() {

    return {
        Types: {
            Boolean: typeof true,
            Number: typeof 0,
            String: typeof"",
            Object: typeof{ },
            Undefined: typeof undefined,
            Function: typeof function() {
            }
        },
        PS: {
            Tree: {clickNode : "TreeClickNode"}
        }
    };
});