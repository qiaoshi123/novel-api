
function filter() {
    return function(req, res, next) {
        res.success =(data)=> {
            res.send({
                status:1,
                data,
                msg:''
            })
        };
        res.fail = (data) =>{
            res.send({
                status:500,
                data,
                msg:'api错误'
            })
        };
        next();
    }
}

module.exports = filter;
