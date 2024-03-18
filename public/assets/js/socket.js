//--------------------------Multi Chat App --------------------------

function getCookie(name) {
    let matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
  
let userData = JSON.parse(getCookie("user"));
  
let sender_id = userData._id;
let receiver_id;
let socket = io("/user", {
  auth: {
    token: userData._id,
  },
});


socket.on("getOnlineUser", (data) => {
    $("#" + data.userId + "-status").html(
      '<i style="font-size:18px;color: green;" class="far">&#xf4ad;</i>'
    );
    $("#" + data.userId + "-status").removeClass("status2 ");
    $("#" + data.userId + "-status").addClass("status1");
});
  
socket.on("getOfflineUser", (data) => {
    $("#" + data.userId + "-status").html(
      '<i style="font-size:15px;color:red" class="fas">&#xf4b3;</i>'
    );
    $("#" + data.userId + "-status").addClass("status2 ");
    $("#" + data.userId + "-status").removeClass("status1");
});
  
$(document).ready(function () {
    $(".user-list").click(function () {
      let user_id = $(this).attr("data-id");
      receiver_id = user_id;
      $(".chat-text").hide();
      $(".chat-section").show();
      socket.emit("existsChat", {
        sender_id: sender_id,
        receiver_id: receiver_id,
      });
    });
});
  
$("#chat-form").submit(function (event) {
    event.preventDefault();
    let message = $("#message").val();
    $.ajax({
      url: "/user/savechat",
      type: "POST",
      data: {
        sender_id: sender_id,
        receiver_id: receiver_id,
        message: message,
      },
      success: function (res) {
        if (res.success) {
          $("#message").val("");
          let chat = res.data.message;
          let html = ` <div class="current-user-chat">` + chat + `</div>`;
          $("#chat-container").append(html);
          socket.emit("newChat", res.data);
          scrollChat();
        } else {
          alert("else called", data.msg);
        }
      },
    });
});


//---------------load chats-------------------//
socket.on("loadNewChat", (data) => {
    if (sender_id == data.receiver_id && receiver_id == data.sender_id) {
      let html = ` <div class="distance-user-chat">` + data.message + `</div>`;
      $("#chat-container").append(html);
    }
    scrollChat();
});


//------------load old chats----------//
socket.on("loadChats", (data) => {
    $("#chat-container").html("");
    let chats = data.chats;
    let html = "";
    for (let i = 0; i < chats.length; i++) {
      let addClass = "";
  
      if (chats[i]["sender_id"] == sender_id) {
        addClass = "current-user-chat";
      } else {
        addClass = "distance-user-chat";
      }
  
      html += ` <div class="` + addClass + `">` + chats[i]["message"] + `</div>`;
    }
    $("#chat-container").append(html);
    scrollChat();
});
  
function scrollChat() {
    $("#chat-container").animate(
      {
        scrollTop:
          $("#chat-container").offset().top +
          $("#chat-container")[0].scrollHeight,
      },
      0
    );
}
  

// Add Member
$('.addMember').click(function () {
  var id = $(this).attr('data-id');
  var limit = $(this).attr('data-limit');

  $('#group_id').val(id);
  $('#limit').val(limit); 

  $.ajax({
    url: '/user/getmember',
    type: 'POST',
    data: {
      group_id: id
    },
    success: function (res) {
      if (res.success) {
        let users = res.data;
        var html = '';
        for (var i = 0; i < users.length; i++) {
          
          let isMemberOfGroup = users[i]['member'].length > 0?true:false;

          html += `
          <tr>
              <td><input type="checkbox" `+(isMemberOfGroup?'checked':'')+` name="members" value="`+users[i]['_id']+`"></td>
              <td>`+users[i]['name']+`</td>
          </tr>
          `;
        }

        $('#addMemberInTable').html(html);
      } else {
        alert(res.message);
      }
    }
  });
}
);


// Update Member
$(document).ready(function() {
  $('#add-member-form').submit(function (event) {
    event.preventDefault();
    var formData = $(this).serialize();  
    $.ajax({
      url: '/user/addmember',
      type: 'POST',
      data: formData,
      success: function (res) {
        if (res.success) {
          setTimeout(function() {
          location.reload();
        }, 1000);
            Swal.fire({
              title: "ADD!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500
            });
        } else {
          $('#error').html(res.message);
        }
      }
    });
  });
});


//Upadte Group
$('.updateGroup').click(function () {
  var obj = JSON.parse($(this).attr('data-obj'));
  $('#group_i').val(obj._id);
  $('#last_limit').val(obj.limit);
  $('#group_name').val(obj.name);
  $('#group_limit').val(obj.limit);

}
);

$('#updateChatGroupForm').submit(function (event) {
  event.preventDefault();

  var formData = new FormData(this);

  $.ajax({
    url: '/user/updategroup',
    type: 'POST',
    contentType: false, 
    cache: false,
    processData: false,
    data: formData,
    success: function (res) {
      if (res && res.success) { 
        setTimeout(function() {
          location.reload();
            },1000);

            Swal.fire({
              title: "UPDATE!!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500
            });
       
      } else {
        $('#error').html(res ? res.message : 'Unknown error occurred');
      }
    },
    error: function(xhr, status, error) {
      console.error('Error:', error);
      $('#error').html('An error occurred while processing your request.');
    }
  });
});


// Delete Group
$('.deleteGroup').click(function(){
  $('#delete_group_id').val($(this).attr('data-id'));
  $('#delete_group_name').text($(this).attr('data-name'));
});

$('#deleteChatGroupForm').submit(function(event){
  event.preventDefault();

  var formData = $(this).serialize();

  $.ajax({
    url:"/user/deletegroup",
    type:"post",
    data:formData,
    success:function (res) {
      if(res.success){
        
        setTimeout(function() {
          location.reload();
         },1000);

          Swal.fire({
            title: "DELETE!!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
          });
      }
    }
  })
})


//Copy Group
$('.copyGroup').click(function(){
  var group_id = $(this).attr('data-id');
  var url = window.location.host+'/share-group/'+group_id;
  
  var temp = $("<input>");
  $("body").append(temp);
  
  temp.val(url).select();
  document.execCommand("copy");
  
  temp.remove();
  setTimeout(function() {
    Swal.fire({
      title: "Copied!",
      icon: "success",
      showConfirmButton: false,
      timer: 1500
    });
  }, 100); // Adjust the delay time if needed
});


//Join Group
$('.join-now').click(function () {
  $(this).text('Wait.....!');
  $(this).attr('disabled', 'true');

  var group_id = $(this).attr('data-id');
  $.ajax({
    url:'/user/join-group',
    type:'post',
    data:{group_id:group_id},
    success:function(res){
      if(res.success){
        setTimeout(function() {
          location.reload();
            },1000);
            Swal.fire({
              title: "JOINED!!",
              icon: "success",
              showConfirmButton: false,
              timer: 1500
            });
      }else{
        alert(res.message);
        $(this).text('Join Now')
        $(this).removeattr('disabled');
      }
    }

  })
});


//Group Chat
$(document).ready(function () {
  $(".group-list").click(function () {
    let user_id = $(this).attr("data-id");
    receiver_id = user_id;
    $(".group-chat-text").hide();
    $(".group-chat-section").show();
    });
});