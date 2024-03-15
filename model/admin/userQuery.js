const User = require("../user/user")

const findData = async (obj,sortObj,skip,limit) =>{
    // console.log("obj",obj)
    const data = await User.find(obj).sort(sortObj).skip(skip).limit(limit).lean();
    return data;
}

const countData = async (obj) =>{
    const data = await User.find(obj).countDocuments(obj);
    return data;
}


module.exports = {
    findData,
    countData
}