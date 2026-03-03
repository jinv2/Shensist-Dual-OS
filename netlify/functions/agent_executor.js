// 使用 Netlify 预装的环境，无需额外安装找不到的 gitybara
const fs = require('fs');

exports.handler = async (event) => {
    const { action, params } = JSON.parse(event.body);
    
    // 逻辑让 AI 有规则，行为让 AI 有回应 
    if (action === 'GENERATE_BUSINESS_DOC') {
        // 行为：不再回复文字，而是直接生成一个真实的 .csv (Excel可开) 文件内容
        const csvContent = "项目,金额,权益\n" + params.data.map(d => `${d.item},${d.price},${d.right}`).join("\n");
        
        // 将文件内容转为 Base64，让客户能直接下载
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
};
