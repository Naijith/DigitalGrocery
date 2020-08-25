cd digital-grocery
start "DATABASE" /min c:\xampp\mysql_start.bat
set ip_address_string="IPv4 Address"
for /f "usebackq tokens=2 delims=:" %%f in (`ipconfig ^| findstr /c:%ip_address_string%`) do (
    start chrome http://%%f
)
start "digital-grocery" node app.js
taskkill /F /IM cmd.exe

