import re
import sys

def vtt_to_srt(content):
  replacement = re.sub(r'(\d\d:\d\d:\d\d).(\d\d\d) --> (\d\d:\d\d:\d\d).(\d\d\d)(?:[ \-\w]+:[\w\%\d:]+)*\n', r'\1,\2 --> \3,\4\n', content)
  replacement = re.sub(r'(\d\d:\d\d).(\d\d\d) --> (\d\d:\d\d).(\d\d\d)(?:[ \-\w]+:[\w\%\d:]+)*\n', r'\1,\2 --> \3,\4\n', replacement)
  replacement = re.sub(r'(\d\d).(\d\d\d) --> (\d\d).(\d\d\d)(?:[ \-\w]+:[\w\%\d:]+)*\n', r'\1,\2 --> \3,\4\n', replacement)
  replacement = re.sub(r'WEBVTT\n', '', replacement)
  replacement = re.sub(r'Kind:[ \-\w]+\n', '', replacement)
  replacement = re.sub(r'Language:[ \-\w]+\n', '', replacement)
  #replacement = re.sub(r'^\d+\n', '', replacement)
  #replacement = re.sub(r'\n\d+\n', '\n', replacement)
  replacement = re.sub(r'<c[.\w\d]*>', '', replacement)
  replacement = re.sub(r'</c>', '', replacement)
  replacement = re.sub(r'<\d\d:\d\d:\d\d.\d\d\d>', '', replacement)
  replacement = re.sub(r'::[\-\w]+\([\-.\w\d]+\)[ ]*{[.,:;\(\) \-\w\d]+\n }\n', '', replacement)
  replacement = re.sub(r'Style:\n##\n', '', replacement)
  replacement = re.sub(r'^\s*$', '\n1', replacement)

  return replacement

def _windows_safe_filename(name):
    # see
    # https://docs.microsoft.com/en-us/windows/desktop/fileio/naming-a-file
    replace_chars = {
        '<': '《',
        '>': '》',
        ':': '：',
        '"': '“',
        '/': '_',
        '\\': '_',
        '|': '_',
        '?': '？',
        '*': '_',
    }
    for k, v in replace_chars.items():
        name = name.replace(k, v)
    return name


def safe_file_name(name):
    """replace special characters in name so it can be used as file/dir name.

    Args:
        name: the string that will be used as file/dir name.

    Return:
        a string that is similar to original string and can be used as
        file/dir name.

    """
    if sys.platform == 'win32':
        name = _windows_safe_filename(name)
    else:
        replace_chars = {
            '/': '_',
        }
        for k, v in replace_chars.items():
            name = name.replace(k, v)
    return name