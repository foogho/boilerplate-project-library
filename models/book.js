const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    title: { type: String, required: true },
    comments: [
      {
        type: String,
      },
    ],
    commentcount: {
      type: Number,
    },
  },
  {
    versionKey: false,
  }
);

schema.pre('save', function (next) {
  this.commentcount = this.comments.length;
  next();
});

module.exports = model('Book', schema);
