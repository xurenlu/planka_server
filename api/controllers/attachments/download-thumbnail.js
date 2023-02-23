const fs = require('fs');
const path = require('path');

const Errors = {
  ATTACHMENT_NOT_FOUND: {
    attachmentNotFound: 'Attachment not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9a-zA—Z]+$/,
      required: true,
    },
  },

  exits: {
    attachmentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    // eslint-disable-next-line no-console

    const { currentUser } = this.req;
    sails.log.error('inputs:', inputs==undefined);
    const { attachment, card, project } = await sails.helpers.attachments
      .getProjectPath(inputs.id)
      .intercept('pathNotFound', () => Errors.ATTACHMENT_NOT_FOUND);
    /*
    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        throw Errors.ATTACHMENT_NOT_FOUND; // Forbidden
      }
    }
  */
    if (!attachment.image) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    const filePath = path.join(
      sails.config.custom.attachmentsPath,
      attachment.dirname,
      'thumbnails',
      `cover-256.${attachment.image.thumbnailsExtension}`,
    );

    if (!fs.existsSync(filePath)) {
      throw Errors.ATTACHMENT_NOT_FOUND;
    }

    this.res.type('image/jpeg');
    this.res.set('Cache-Control', 'private, max-age=900'); // TODO: move to config

    return exits.success(fs.createReadStream(filePath));
  },
};
