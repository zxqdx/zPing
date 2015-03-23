/**
 * RenderController
 *
 * @description :: Server-side logic for managing Renders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    


  /**
   * `RenderController.homepage()`
   */
  homepage: function (req, res) {
    req.setLocale('zh');
    return res.view('homepage');
  }
};

