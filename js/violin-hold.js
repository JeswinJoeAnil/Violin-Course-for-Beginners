document.querySelector('a[href="#bow-arm-prep"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('bow-arm-prep').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });