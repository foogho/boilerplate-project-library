$(document).ready(function () {
  let items = [];
  let itemsRaw = [];

  $.getJSON('/api/books', function (data) {
    itemsRaw = data;
    $.each(data, function (i, val) {
      items.push(`
      <div class="col book">
          <div class="card text-center">
            <div class="card-header">${val.title}</div>
            <div class="card-body py-4">
              <p class="card-text">comment count: ${val.commentcount}</p>
              <div class="row g-1">
                <div class="col"><button class="btn btn-sm btn-secondary showCommentsBtn" data-bookIdx="${i}" data-bs-toggle="modal" data-bs-target="#commentsModal">Comments</button></div>
                <div class="col"><button class="btn btn-sm btn-danger deleteBookBtn" id="${val._id}">Delete Book</button></div>
              </div>
            </div>
          </div>
        </div>
      `);
    });
    $('#bookList').html(items.join(''));
  });

  $('#bookList').on('click', '.book .deleteBookBtn', function () {
    confirm('are you sure?')
      ? $.ajax({
          type: 'DELETE',
          url: '/api/books/' + this.id,
          success: () => {
            location.reload();
          },
        })
      : '';
  });

  $('#commentsModal').on('show.bs.modal', function ({ relatedTarget }) {
    const book = itemsRaw[relatedTarget.getAttribute('data-bookIdx')];
    $(this)
      .find('.modal-title')
      .text(book.title + ' comments');
    fetchAndRenderComments(book._id);
    $(this)
      .find('#commentForm')
      .on('submit', function (e) {
        e.preventDefault();
        $.ajax({
          url: '/api/books/' + book._id,
          type: 'POST',
          data: $(this).serialize(),
          success: () => {
            fetchAndRenderComments(book._id);
            $(this).find('input').val('');
          },
        });
      });
  });

  $('#newBookForm').on('submit', function (e) {
    e.preventDefault();
    $.ajax({
      url: '/api/books',
      type: 'POST',
      data: $(this).serialize(),
      success: () => {
        location.reload();
      },
    });
  });

  $('#deleteAllBooks').on('click', function () {
    confirm('are you sure')
      ? $.ajax({
          url: '/api/books',
          type: 'DELETE',
          success: () => {
            location.reload();
          },
        })
      : '';
  });
});

function fetchAndRenderComments(bookId) {
  $.getJSON('/api/books/' + bookId, (book) => {
    $('#commentsModal .modal-body ul').html(
      book.comments.map((comment) => `<li>${comment.comment}</li>`)
    );
  });
}
