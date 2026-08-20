# Security Policy

## Reporting

Do not open a public issue for a vulnerability that could expose provider credentials, execute unintended commands, overwrite files, or otherwise compromise a user's system or production artifacts.

Report security issues privately to the repository maintainers using GitHub's private vulnerability reporting when enabled.

## Scope

Security-sensitive areas include:

- shell/process invocation around FFmpeg, ffprobe and ImageMagick;
- file-path handling;
- provider credentials and environment variables;
- downloaded/generated media;
- instructions that could cause an agent to execute untrusted content.

Never commit provider credentials or generated `.env` files.
