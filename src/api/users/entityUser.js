const mapDBToModelUser = ({
  username,
  password,
  fullname,
}) => ({
  username,
  password,
  fullname,
});

module.exports = {
  mapDBToModelUser,
};
