import re

with open('src/api/model/getApiTeacherClassAssignmentGetParams.ts', 'r') as f:
    get_params = f.read()
get_params = re.sub(r'export type GetApiTeacherClassAssignmentGetParams = {.*?};\s*export type GetApiTeacherClassAssignmentGetParams = {.*?};', 'export type GetApiTeacherClassAssignmentGetParams = {\n    teacherId?: number;\n    schoolID?: number;\n};', get_params, flags=re.DOTALL)
with open('src/api/model/getApiTeacherClassAssignmentGetParams.ts', 'w') as f:
    f.write(get_params)
