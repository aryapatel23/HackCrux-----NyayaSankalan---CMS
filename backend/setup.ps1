$folders = @(
"dist/config","dist/middleware","dist/modules",
"dist/prisma","dist/services","dist/utils",
"src/config","src/middleware","src/modules/ai/__tests__",
"src/modules/analytics","src/modules/audit","src/modules/auth",
"src/modules/bail","src/modules/case","src/modules/case-reopen",
"src/modules/closure-report","src/modules/court","src/modules/document",
"src/modules/document-requests","src/modules/fir","src/modules/investigation",
"src/modules/organization","src/modules/search","src/modules/timeline",
"src/prisma","src/services","src/utils",
"prisma/migrations","prisma/seed"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder
}