@echo off
chcp 65001 >nul
echo ========================================
echo    地址管理页面 - 重新编译脚本
echo ========================================
echo.

echo [1/3] 关闭微信开发者工具...
echo 请先手动关闭微信开发者工具，然后按任意键继续...
pause >nul

echo [2/3] 清理编译缓存...
rd /s /q unpackage\dist 2>nul
rd /s /q unpackage\.cache 2>nul
echo ✓ 缓存清理完成

echo [3/3] 重新编译...
echo ✓ 请在HBuilderX中重新运行项目
echo 或者执行：npm run dev:mp-weixin

echo.
echo ========================================
echo    完成！现在请重新打开项目
echo ========================================
echo.
pause
