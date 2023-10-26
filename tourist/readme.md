# TIPS GIT COMMIT

## Chế độ reset commit develop

new 123

1. Soft Seset

```bash
git reset --soft-HEAD~
```

- Giữ lại các thay đổi trong stage changes và có thể commit lại các thay đổi đó

2. Hard Reset

```bash
git reset --hard-HEAD~
```

- Loại bỏ các thay đổi trong stage changes và không thể commit lại các thay đổi đó.

## Chế độ MERGE-SQUASH commit

1. Thay đổi branch cần SQUASH

```bash
  git checkout <your branch>
```

2. Xem lại các commit

```bash
  git log --oneline
```

3. Chọn commit
   > Khi chúng ta muốn merge các commit có chung một nhiệm vụ gộp lại thành một commit, trách tạo ra nhiều commit không cần thiết trong history commit. Để squash được bạn cần có hash id của commit nằm trước tất cả các commit cần squash

```bash
 git rebase -i <commit nằm trước>
```

- Sau khi rebase sẽ xuất hiện dòng như sau

  ![Alt text](image-2.png)

  1. `pick` là command, thì `pick` sẽ giữ lại commit đó và không thay đổi gì.
  2. `7424f7c` là hash id
  3. `update readme.md` là commit message

4. Tiếp tục Squash

   1. nhấn i để edit content

   2. thay đổi command từ `pick` sang `squash` đối với các hash id cần squash

   3. Nhấn `ESC` để thoát khỏi chế độ `INSERT`

   4. Gõ `:wq` để thoát khỏi chế độ thay đổi

5. Cập nhật lại commit message mới

- Xóa bớt và chỉ giữ lại những gì bạn thấy cần.
- Comment có thể bỏ qua vì sẽ không được đưa vào commit message thực tế
- Gõ :wq để write và quit

> Trường hợp muốn undo squash chỉ cần copy hash id cuối sau đó nhập vào terminal

```bash
git reset --hard <hash id>
```

- Bạn có thể kiểm tra lại bằng cách

```bash
git reflog
```

## Tạo một branch mới

```bash
git branch <branch name>
```

```bash
git checkout <branch name>
```

Tạo và di chuyển trực tiếp

```bash
git checkout -b <tên branch>
```

## Chế độ GIT PUSH commit

- Chế độ chỉ push lên những phần của mình

```bash
git push -f
```

> Nó sẽ xóa bỏ hoàn toàn các commit khác khi được push lên một reponsitory chung.
