# Introduction

## Model

- User(teacher)
- User(student)

- Subject 科目
- Exam 试卷
- ExamSession 考试行为
- Question 一道题目

## Relation

- 一个 Teacher 可以管理多个 Subject
- 一个 Subject 包含着多个 Exam
- 一个 Exam 包含着多个 Question，一个 Question 可以被多个 Exam 选中

- 一个 Student 有多个 Subject，一个 Subject 能被多个 Student 选择
- 一个 Subject 包含着多个 Exam，一个 Exam 对应着一个 ExamSession（每个 Student 都有各自独立的 ExamSession）

# Subject

## With inviteCode

- 课程邀请码

# Question

## With Tags

- Teacher 组卷通过 Tag 进行挑选

## With Answer

- 客观题，给出标准答案
- 主观题，给出参考答案

## Type

- 单选题
- 多选题
- 判断题
- 填空题
- 论述题

```json
[
  {
    "content": "HTTP 状态码 404 表示什么？",
    "type": "single_choice",
    "options": [
      "Not Found",
      "Bad Request",
      "Unauthorized",
      "Internal Server Error"
    ],
    "answer": 0
  },
  {
    "content": "以下哪些是 JavaScript 的原始类型？",
    "type": "multiple_choice",
    "options": ["string", "array", "boolean", "object", "number"],
    "answer": [0, 2, 4]
  },
  {
    "content": "TypeScript 是 JavaScript 的超集。",
    "type": "true_false",
    "options": ["正确", "错误"],
    "answer": 0
  },
  {
    "content": "HTML 中，____ 标签用于创建超链接。",
    "type": "fill_blank",
    "options": null,
    "answer": ["a"]
  },
  {
    "content": "解释 RESTful API 的设计原则，并举例说明。",
    "type": "essay",
    "options": null,
    "answer": "RESTful API 的核心原则包括：无状态、统一接口、资源导向..."
  }
]
```

# Exam

## With Information

- 每个 Exam 都需要注明每道题目的分值

```json

```

# ExamSession

## With Information

- Teacher 可以对特定 Student 的 ExamSession 做出批改反馈
- Student 可以对每次考试结果
