@echo off
REM Sync repo docs into Obsidian mirror

cd /d C:\Users\biche\cloud-heroes-africa-platform

REM 1) Pull latest changes from origin
REM git pull

REM 2) Copy core docs into Obsidian vault mirror (overwrite without asking)
copy "docs\decision-log.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\decision-log.md" /Y

copy "docs\student-hub\Project-Overview.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\SHUB - Project Overview.md" /Y

copy "docs\student-hub\login.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\SHUB - Login.md" /Y

copy "docs\student-hub\profile.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\SHUB - Profile.md" /Y

copy "docs\student-hub\dashboard.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\SHUB - Dashboard.md" /Y

REM 3) Copy ADRs
copy "docs\adr\0000-template.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\0000-template.md" /Y

copy "docs\adr\0001-student-hub-auth-approved-email-google-oauth.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\0001-student-hub-auth-approved-email-google-oauth.md" /Y

copy "docs\adr\0002-student-hub-ui-library.md" ^
  "E:\SecondBrain\Projects\Cloud Heroes Africa\Repo Mirror\0002-student-hub-ui-library.md" /Y