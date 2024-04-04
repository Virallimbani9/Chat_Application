const Group = require("../user/group")

const findData = async (obj,sortObj,skip,limit) =>{
    const data = await Group.find(obj).sort(sortObj).skip(skip).limit(limit).lean();
    return data;
}

const countData = async (obj) =>{
    const data = await Group.find(obj).countDocuments(obj);
    return data;
}


module.exports = {
    findData,
    countData
}