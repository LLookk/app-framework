ali.defineClass("ali.openpf.isv.createApp",ali.model,{
    events: {
      "click span.appdelete": "onAppDelete",
      "click #closedlgIcon": "doDlgClose",
      "click #confirmbtn": "doAction",
      "click #cancelbtn": "doCancel",
      "click span.applyReason": "onApplyReason",
      "click #findSecretKey": "onFindSecretKey",
      "click #resetSecretKey": "onResetSecretKey",
      "change #cappcheckbox": "oncappcheckboxChange"
    },

    oncappcheckboxChange: function() {
      var isChecked=this.iscappcheckboxChecked();
      this.logger.log(isChecked);
      this.$("#cappcheckbox_error").css("display",isChecked?'none':'block');
    },
    iscappcheckboxChecked: function() {
      return this.$("#cappcheckbox").prop('checked');
    },
    doSubmit: function(){
        if (this.doV()) {
            this.$('#createAppForm')[0].submit();
        }
        return false;
    },
    doV: function(){
       var vd = new FE.ui.Valid(jQuery('.editEl', this.$el), {
                onValid : function(res, o) {
                    switch (o.type) {
                        case 'fun':
                            if (!o.msg) {
                                res = 'nopass';
                            }
                    }
                    var fferror = jQuery(this).siblings('.comp-ff-fferror');
                    fferror.css('display', (res == 'pass') ? 'none' : 'block');
                }
        });
        if (!vd.valid()) {
            return false;
        }
        if(!this.iscappcheckboxChecked()){
          this.oncappcheckboxChange();
          return false;
        }
        return true;
    },

    reloadAppList : function(){
      jQuery("#mygrid").setGridParam({
        url:jQuery("#list_url").attr("value")
      }).trigger("reloadGrid"); 
    },

    showDialog : function(){
      this.$('#confirmbtn').css('display',"block");
      var d = this.$("#applistDlg");
      jQuery.use('ui-dialog', function(){
        d.dialog({
          modal: true,
          draggable: {
           handle: "#dheader",
           containment: 'body'
          },
          shim: true,
          center: true
        });
      });
      //jQuery("#dheader" ).draggable();
    },

    //���öԻ��� title
    setDialogTitle : function(title){
      this.$('#dheader>p').html(title);
    },
    // ���öԻ�������
    setDialogContent : function(content){
      this.$('#dbody').html(content);
    },

    setDialogLoading : function(content){
      this.$('#dbody').html('<span><img src="http://img.china.alibaba.com/cms/upload/2012/924/303/303429_1255716180.gif"/></span>' + content);
    },
   
    // ��öԻ�������Ԫ�� 
    getDialogContentEl : function(){
      return  this.$('#dbody');
    },

    // set/get �Ի���ȷ�ϰ�ť�󶨵�data
    dialogConfirmBtnData : function(){
      if(arguments.length === 1){
        return this.$('#confirmbtn').data(arguments[0]);  
      }
      if(arguments.length === 2){
        this.$('#confirmbtn').data(arguments[0],arguments[1]);
      }
    },

    hideDialogBtn : function(){
      this.$('#confirmbtn').hide();
      this.$('#cancelbtn').hide();
    },

    showDialogBtn : function(){
      this.$('#confirmbtn').show();
      this.$('#cancelbtn').show();
    },

    showSuccessinfo : function(content){
      this.$("#msg-level").attr("class","comp-ff-big-success");
      this.$("#msg-level span.info").html(content);
      this.$("#remind-msg").fadeIn(800).delay(1500).fadeOut(800);
    },

    showErrorinfo : function(content){
      this.$("#msg-level").attr("class","comp-ff-big-error");
      this.$("#msg-level span.info").html(content);
      this.$("#remind-msg").fadeIn(400).delay(1500).fadeOut(400);
    },

    showWarninfo : function(content){
      this.$("#msg-level").attr("class","comp-ff-big-warn");
      this.$("#msg-level span.info").html(content);
      this.$("#remind-msg").fadeIn(400).delay(1500).fadeOut(400);
    },

    showAttentioninfo : function(content){
      this.$("#msg-level").attr("class","comp-ff-big-attentions");
      this.$("#msg-level span.info").html(content);
      this.$("remind-msg").fadeIn().delay().fadeOut();;
    },

    onAppDelete: function(e){
      this.delete_url = this.$(e.target).data('url');
      this.logger.info(this.delete_url);
      this.setDialogTitle('ɾ��App');
      this.dialogConfirmBtnData("action","delete");
      this.setDialogContent('ȷ��ɾ����');
      this.showDialog();
      return false;
    },

    
    doDlgClose: function(){
      this.$("#applistDlg").dialog('close');
    },

    doCancel: function(){
       this.doDlgClose();
    },
   
    onApplyReason: function(e){
      this.apply_reason_url = this.$(e.target).data('url');
      this.logger.info(this.apply_reason_url);
      this.setDialogContent('Loading...');
      this.showDialog();
      
      ali.network.ajax({
        url : this.apply_reason_url,
        showMsgObj:{
          msgEl: this.getDialogContentEl(),
          errorMsg:'�Բ��𣬲���ʧ�ܣ����Ժ�����'
        },
        success: function(json){
          var response = jQuery.parseJSON(json);
          this.logger.info(response);
          if(response.success){
            this.logger.info("success :" + response);
            if( response.result == null || response.result.trim() == ''){
              this.setDialogContent('�Բ��𣬲���ʧ�ܣ����Ժ�����');
            }else{
              this.setDialogContent(response.result);
            }
          }else{
            this.setDialogContent(response.errMsg == null ? '�Բ��𣬲���ʧ�ܣ����Ժ�����' : response.errMsg);
          }
        }.bind(this),

        timeout : function(xhr,status,errormsg){
          if(status=='timeout'){
              this.setDialogContent('�Բ��𣬲��ҳ�ʱ�����Ժ�����');
              this.logger.info(" find apply reason app timeout");
          }
        }
      });
    },
    
    // ���� appSecretKey �Ĵ���
    onResetSecretKey : function(e){
      this.logger.info(e.target);
      this.resetSecretKeyUrl = this.$(e.target).data("url");
      this.dialogConfirmBtnData("action","resetSecretKey");
      this.logger.info(this.resetSecretKeyUrl);
      this.setDialogTitle("���� app secret key");
      this.setDialogContent('ȷ�����ã�');
      this.showDialog();
      return false;
    },

    // �鿴 appSecretKey �Ĵ���
    onFindSecretKey : function(e){
      var target = jQuery("#findSecretKey");
      this.logger.info(target);
      this.findSecretKeyUrl = target.data("url");
      this.logger.info(this.findSecretKeyUrl);
      this.setDialogTitle('�鿴 app secret key');
      this.setDialogLoading('������');
      this.showDialog();

      ali.network.ajax({
        url : this.findSecretKeyUrl,
        success: function(json){
          var response = jQuery.parseJSON(json);
          this.logger.info(response);
          if(response.success){
            this.logger.info("success :" + response);
              if( response.result == null || response.result.trim() == ''){
                this.setDialogContent('�Բ��𣬲���ʧ�ܣ����Ժ�����');
              }else{
                this.setDialogContent('���� app secrey key Ϊ : ' + '<strong>' + response.result + '</strong>');
              }
           }else{
             this.setDialogContent('�Բ��𣬲���ʧ�ܣ����Ժ�����');
           }
         }.bind(this),

         error : function(xhr,status,errorMsg){
           if(status=='timeout'){
               this.setDialogContent('�Բ�������ʱ��������');
               this.logger.info(" find apply reason app timeout");
           }
         }.bind(this)
       });
       //this.$("#dbody").addClass("loading");
      return false;
    },

    doAction: function(){
      var action = this.dialogConfirmBtnData("action");
      this.dialogConfirmBtnData("action", null); // clean the action
      //ɾ��app
      if("delete" == action){
        this.doDelete();
      }
      else if("resetSecretKey" == action){
        this.doResetSecretKey();
      }
      else if("reloadApplist" == action){
        this.doReloadApplist();
      }
      else{ //����������Ĭ�Ϲر�
       this.doDlgClose();
      }
    },

    //��ɾ��������
    doDelete : function(){
      if(this.delete_url){
        ali.network.ajax({
          url : this.delete_url,
          type: "POST",
          beforeSend : function(xhr, settings){
            this.hideDialogBtn();
            this.setDialogLoading('ɾ����');
          }.bind(this),
          success: function(json){
            var response = jQuery.parseJSON(json);
            this.logger.info(response);
            if(response.success){
              this.showSuccessinfo("ɾ���ɹ�");
              this.logger.info("ɾ���ɹ�");
              this.reloadAppList();
            }else{
              this.showErrorinfo(response.errMsg == null ? '�Բ���ɾ��ʧ�ܣ����Ժ�����' : response.errMsg);
              this.logger.info("ɾ��ʧ��");
            }
          }.bind(this),
          error : function(xhr,status,errorMsg){
              this.showErrorinfo('�Բ���ɾ��ʧ�ܣ����Ժ�����');
              this.logger.info(" delete app timeout");
          }.bind(this), 
          complete : function(xhr, status){
            this.doDlgClose();
            this.logger.info(xhr);
            this.logger.info(status);
          }.bind(this)
        });
      }
      this.delete_url = null; // clean the delete url
    },

    doResetSecretKey : function(){
       this.setDialogLoading('������');
       ali.network.ajax({
        url : this.resetSecretKeyUrl,
        type : "POST",
        success: function(json){
          var response = jQuery.parseJSON(json);
          this.logger.info(response);
          if(response.success){
            this.setDialogContent('�µ� secret key Ϊ : ' +  '<strong>' + response.result + '</strong>');
           }else{
            this.setDialogContent(response.errMsg == null ? '�Բ�������ʧ�ܣ����Ժ�����' : response.errMsg);
           }
         }.bind(this),

         error : function(xhr,status,errorMsg){
           if(status=='timeout'){
               this.setDialogContent('�Բ������ó�ʱ�����Ժ�����');
               this.logger.info(" reset reason app timeout");
           }
         }.bind(this)
       });
       this.resetSecretKeyUrl = null; // clean the reset url
    }

  });
