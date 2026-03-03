// 使用 Netlify 预装的环境，无需额外安装找不到的 gitybara
const fs = require('fs');

exports.handler = async (event) => {
    // 1. 尸检级防御：解析 body
    const body = JSON.parse(event.body || "{}");
    
    // 2. 核心对齐：提取 action 和 params (解决 ReferenceError)
    const action = body.action || "UNKNOWN"; // 确保 action 被定义
    const params = body.params || {}; 
    const data = params.data || [{ item: "默认项目", price: "0", right: "无" }]; 
    
    // 3. 执行逻辑
    try {
        if (action === 'GENERATE_BUSINESS_DOC') {
            const csvContent = "项目,金额,权益\n" + data.map(d => `${d.item},${d.price},${d.right}`).join("\n");
            
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="Shensist_Contract_${Date.now()}.csv"` 
                },
                body: Buffer.from(csvContent).toString('base64'),
                isBase64Encoded: true
            };
        }
        return { statusCode: 400, body: "未识别的行为指令" };
    } catch (err) {
        return { statusCode: 500, body: err.message };
    }
};
